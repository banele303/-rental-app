import "dotenv/config"
import type { Request, Response } from "express"
import { PrismaClient, Prisma } from "@prisma/client"
import { wktToGeoJSON } from "@terraformer/wkt"
import { S3Client, DeleteObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import axios from "axios"
import type { Express } from "express"

const prisma = new PrismaClient()

// Properly configure S3 client with credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

async function uploadFileToS3(file: Express.Multer.File): Promise<string> {
  // Validate S3 configuration
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not configured in environment variables")
  }

  if (!process.env.AWS_REGION) {
    throw new Error("AWS_REGION is not configured in environment variables")
  }

  // Validate file
  if (!file || !file.buffer) {
    throw new Error("Invalid file data - missing file buffer")
  }

  // Create a more unique file name to prevent collisions
  const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9)
  const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "")
  const key = `properties/${uniquePrefix}-${safeFileName}`

  // Ensure proper MIME type for images
  let contentType = file.mimetype

  // Detect common image extensions if mimetype isn't set correctly
  if (!contentType || contentType === "application/octet-stream") {
    const extension = safeFileName.split(".").pop()?.toLowerCase()
    if (extension) {
      switch (extension) {
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg"
          break
        case "png":
          contentType = "image/png"
          break
        case "gif":
          contentType = "image/gif"
          break
        case "webp":
          contentType = "image/webp"
          break
        case "svg":
          contentType = "image/svg+xml"
          break
      }
    }
  }

  try {
    console.log(`Starting S3 upload for file: ${key}`)
    console.log(`File mimetype: ${contentType}, size: ${file.buffer.length} bytes`)

    // Use PutObject with proper content type and caching metadata
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: contentType,
      // Set caching behavior
      CacheControl: "max-age=31536000", // Cache for 1 year
      // Make the object publicly readable
      ACL: "public-read",
      // Ensure the browser displays the image instead of downloading it
      ContentDisposition: "inline",
      // Add metadata to help with debugging
      Metadata: {
        "original-filename": file.originalname,
        "upload-date": new Date().toISOString(),
      },
    })

    // Upload the object
    await s3Client.send(putCommand)
    console.log(`Successfully uploaded file: ${key}`)

    // Verify the object exists and is accessible
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
      const headResponse = await s3Client.send(headCommand)
      console.log(`Verified object exists: ${key}`)
      console.log(`Object Content-Type: ${headResponse.ContentType}`)
    } catch (verifyError) {
      console.error(`Error verifying object: ${key}`, verifyError)
      // Continue despite verification error
    }

    // Return a correctly formatted URL
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    console.log(`Generated file URL: ${fileUrl}`)

    return fileUrl
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = req.query

    const whereConditions: Prisma.Sql[] = []

    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number)
      whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`)
    }

    if (priceMin) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`)
    }

    if (priceMax) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`)
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`)
    }

    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`)
    }

    if (squareFeetMin) {
      whereConditions.push(Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`)
    }

    if (squareFeetMax) {
      whereConditions.push(Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`)
    }

    if (propertyType && propertyType !== "any") {
      whereConditions.push(Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`)
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",")
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`)
    }

    if (availableFrom && availableFrom !== "any") {
      const availableFromDate = typeof availableFrom === "string" ? availableFrom : null
      if (availableFromDate) {
        const date = new Date(availableFromDate)
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l 
              WHERE l."propertyId" = p.id 
              AND l."startDate" <= ${date.toISOString()}
            )`,
          )
        }
      }
    }

    if (latitude && longitude) {
      const lat = Number.parseFloat(latitude as string)
      const lng = Number.parseFloat(longitude as string)
      const radiusInKilometers = 1000
      const degrees = radiusInKilometers / 111 // Converts kilometers to degrees

      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`,
      )
    }

    const completeQuery = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${whereConditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}` : Prisma.empty}
    `

    const properties = await prisma.$queryRaw(completeQuery)

    res.json(properties)
  } catch (error: any) {
    console.error("Error retrieving properties:", error)
    res.status(500).json({ message: `Error retrieving properties: ${error.message}` })
  }
}

export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    })

    if (!property) {
      res.status(404).json({ message: "Property not found" })
      return
    }

    const coordinates: { coordinates: string }[] =
      await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`

    const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "")
    const longitude = geoJSON.coordinates[0]
    const latitude = geoJSON.coordinates[1]

    const propertyWithCoordinates = {
      ...property,
      location: {
        ...property.location,
        coordinates: {
          longitude,
          latitude,
        },
      },
    }
    res.json(propertyWithCoordinates)
  } catch (err: any) {
    console.error("Error retrieving property:", err)
    res.status(500).json({ message: `Error retrieving property: ${err.message}` })
  }
}

// New function to update a property
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const propertyId = Number(id)
    console.log(`Updating property ${propertyId}, request body:`, req.body)

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { location: true },
    })

    if (!existingProperty) {
      res.status(404).json({ message: "Property not found" })
      return
    }

    // Handle authorization check - ensure user can edit this property
    const { managerCognitoId } = req.body
    if (managerCognitoId && managerCognitoId !== existingProperty.managerCognitoId) {
      const isAdmin = req.headers["x-user-role"] === "admin" // Example authorization check
      if (!isAdmin) {
        res.status(403).json({ message: "Unauthorized to update this property" })
        return
      }
    }

    // Extract location data
    const { address, city, state, country, postalCode, ...propertyData } = req.body

    // Handle file uploads if any
    const files = (req.files as Express.Multer.File[]) || []
    let photoUrls = existingProperty.photoUrls || []

    if (files.length > 0) {
      try {
        // Upload new files
        const newPhotoUrls = await Promise.all(files.map((file) => uploadFileToS3(file)))

        // Replace or append photos based on request
        if (req.body.replacePhotos === "true") {
          // Delete existing photos from S3 if replace is specified
          if (photoUrls.length > 0) {
            try {
              await Promise.all(photoUrls.map((url) => deleteFileFromS3(url)))
            } catch (deleteError) {
              console.warn("Error deleting old photos:", deleteError)
              // Continue with the update despite deletion errors
            }
          }
          photoUrls = newPhotoUrls
        } else {
          // Append new photos to existing ones
          photoUrls = [...photoUrls, ...newPhotoUrls]
        }

        console.log("Updated photos:", photoUrls)
      } catch (uploadError) {
        console.error("Error uploading files to S3:", uploadError)
        res.status(500).json({
          message: "Error uploading files to S3",
          error: uploadError instanceof Error ? uploadError.message : String(uploadError),
        })
        return
      }
    }

    // Update location if address info is provided
    if (address || city || country) {
      try {
        // Only geocode if address components changed
        const hasAddressChanged =
          (address && address !== existingProperty.location.address) ||
          (city && city !== existingProperty.location.city) ||
          (state && state !== existingProperty.location.state) ||
          (country && country !== existingProperty.location.country) ||
          (postalCode && postalCode !== existingProperty.location.postalCode)

        if (hasAddressChanged) {
          // Build address string for geocoding
          const addressParts = [address || existingProperty.location.address, city || existingProperty.location.city]

          if (state || existingProperty.location.state) {
            addressParts.push(state || existingProperty.location.state)
          }

          if (postalCode || existingProperty.location.postalCode) {
            addressParts.push(postalCode || existingProperty.location.postalCode)
          }

          addressParts.push(country || existingProperty.location.country)
          const addressString = addressParts.join(", ")

          // Get coordinates from address using Google Maps Geocoding API
          const geocodingResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              addressString,
            )}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
          )

          if (geocodingResponse.data.status === "OK" && geocodingResponse.data.results[0]) {
            const { lat, lng } = geocodingResponse.data.results[0].geometry.location

            // Update location
            await prisma.$executeRaw`
              UPDATE "Location" 
              SET 
                "address" = ${address || existingProperty.location.address},
                "city" = ${city || existingProperty.location.city},
                "state" = ${state || existingProperty.location.state},
                "country" = ${country || existingProperty.location.country},
                "postalCode" = ${postalCode || existingProperty.location.postalCode},
                "coordinates" = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
              WHERE id = ${existingProperty.locationId}
            `
          } else {
            throw new Error("Could not geocode the updated address")
          }
        } else {
          // Update location without changing coordinates
          await prisma.location.update({
            where: { id: existingProperty.locationId },
            data: {
              address: address || undefined,
              city: city || undefined,
              state: state || undefined,
              country: country || undefined,
              postalCode: postalCode || undefined,
            },
          })
        }
      } catch (locationError: any) {
        console.error("Error updating location:", locationError)
        res.status(500).json({
          message: `Error updating location: ${locationError.message}`,
          details: locationError,
        })
        return
      }
    }

    // Update property data
    try {
      // Prepare data with type handling
      const updateData: any = {
        ...propertyData,
        photoUrls,
      }

      // Handle array fields properly
      if (propertyData.amenities) {
        updateData.amenities = Array.isArray(propertyData.amenities)
          ? propertyData.amenities
          : typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : undefined
      }

      if (propertyData.highlights) {
        updateData.highlights = Array.isArray(propertyData.highlights)
          ? propertyData.highlights
          : typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : undefined
      }

      // Handle boolean fields
      if (propertyData.isPetsAllowed !== undefined) {
        updateData.isPetsAllowed = propertyData.isPetsAllowed === true || propertyData.isPetsAllowed === "true"
      }

      if (propertyData.isParkingIncluded !== undefined) {
        updateData.isParkingIncluded =
          propertyData.isParkingIncluded === true || propertyData.isParkingIncluded === "true"
      }

      // Handle numeric fields
      if (propertyData.pricePerMonth !== undefined) {
        updateData.pricePerMonth = Number.parseFloat(propertyData.pricePerMonth) || existingProperty.pricePerMonth
      }

      if (propertyData.securityDeposit !== undefined) {
        updateData.securityDeposit = Number.parseFloat(propertyData.securityDeposit) || existingProperty.securityDeposit
      }

      if (propertyData.applicationFee !== undefined) {
        updateData.applicationFee = Number.parseFloat(propertyData.applicationFee) || existingProperty.applicationFee
      }

      if (propertyData.beds !== undefined) {
        updateData.beds = Number.parseInt(propertyData.beds) || existingProperty.beds
      }

      if (propertyData.baths !== undefined) {
        updateData.baths = Number.parseFloat(propertyData.baths) || existingProperty.baths
      }

      if (propertyData.squareFeet !== undefined) {
        updateData.squareFeet = Number.parseInt(propertyData.squareFeet) || existingProperty.squareFeet
      }

      // Update the property
      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: updateData,
        include: {
          location: true,
          manager: true,
        },
      })

      // Fetch the latest coordinates
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${updatedProperty.location.id}`

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "")
      const longitude = geoJSON.coordinates[0]
      const latitude = geoJSON.coordinates[1]

      const propertyWithCoordinates = {
        ...updatedProperty,
        location: {
          ...updatedProperty.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      }

      console.log("Property updated successfully:", propertyWithCoordinates)
      res.json(propertyWithCoordinates)
    } catch (propertyError: any) {
      console.error("Error updating property:", propertyError)
      res.status(500).json({
        message: `Error updating property: ${propertyError.message}`,
        details: propertyError,
      })
    }
  } catch (err: any) {
    console.error("Unhandled error in updateProperty:", err)
    res.status(500).json({ message: `Error updating property: ${err.message}` })
  }
}

// Helper function to delete files from S3
async function deleteFileFromS3(url: string): Promise<void> {
  try {
    // Extract the key from the URL
    const urlObj = new URL(url)
    const key = urlObj.pathname.startsWith("/") ? urlObj.pathname.substring(1) : urlObj.pathname

    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME is not configured")
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    console.log(`Successfully deleted file: ${key}`)
  } catch (error) {
    console.error("Error deleting from S3:", error)
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Function to delete a property
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const propertyId = Number(id)
    console.log(`Deleting property ${propertyId}`)

    // Extract authorization token
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    // Validate token presence
    if (!token) {
      console.warn("Missing authorization token")
      res.status(401).json({ message: "Unauthorized - Missing authentication token" })
      return
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { location: true },
    })

    if (!existingProperty) {
      res.status(404).json({ message: "Property not found" })
      return
    }

    // Handle authorization check - ensure user can delete this property
    const managerCognitoId = req.query.managerCognitoId || req.body.managerCognitoId
    if (managerCognitoId && managerCognitoId !== existingProperty.managerCognitoId) {
      const isAdmin = req.headers["x-user-role"] === "admin" // Example authorization check
      if (!isAdmin) {
        res.status(403).json({ message: "Unauthorized to delete this property" })
        return
      }
    }

    // Delete all photos from S3 first
    if (existingProperty.photoUrls && existingProperty.photoUrls.length > 0) {
      try {
        await Promise.all(existingProperty.photoUrls.map((url) => deleteFileFromS3(url)))
        console.log("Successfully deleted all property photos from S3")
      } catch (deleteError) {
        console.warn("Error deleting photos from S3:", deleteError)
        // Continue with deletion despite S3 errors
      }
    }

    // Start a transaction to ensure both property and location are deleted
    await prisma.$transaction(async (prismaClient) => {
      // Delete any related records that depend on this property (example)
      try {
        // Delete related records first
        await prismaClient.$executeRaw`DELETE FROM "Lease" WHERE "propertyId" = ${propertyId}`
        await prismaClient.$executeRaw`DELETE FROM "Application" WHERE "propertyId" = ${propertyId}`
        // Delete the property
        await prismaClient.property.delete({
          where: { id: propertyId },
        })

        // Delete the location
        await prismaClient.location.delete({
          where: { id: existingProperty.locationId },
        })
      } catch (txError) {
        console.error("Transaction error:", txError)
        throw txError // Re-throw to trigger rollback
      }
    })

    console.log(`Property ${propertyId} deleted successfully`)
    res.json({ message: "Property deleted successfully", id: propertyId })
  } catch (err: any) {
    console.error("Error deleting property:", err)
    res.status(500).json({
      message: `Error deleting property: ${err.message}`,
      error: err,
    })
  }
}