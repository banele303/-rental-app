import 'dotenv/config';
import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

// Define RoomType enum locally to match your Prisma schema
export enum RoomType {
  PRIVATE = "PRIVATE",
  SHARED = "SHARED",
  // Add other types as defined in your schema
}
import { S3Client, ObjectCannedACL, DeleteObjectCommand, PutObjectAclCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const prisma = new PrismaClient();

// Configure S3 client with proper credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Enhanced upload function with better error handling, double-check ACL, and consistent URL construction
async function uploadFileToS3(file: Express.Multer.File): Promise<string> {
  // Validate S3 configuration
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not configured in environment variables");
  }

  if (!process.env.AWS_REGION) {
    throw new Error("AWS_REGION is not configured in environment variables");
  }

  // Validate file
  if (!file || !file.buffer) {
    throw new Error("Invalid file data - missing file buffer");
  }

  // Create a more unique file name to prevent collisions
  const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
  const key = `rooms/${uniquePrefix}-${safeFileName}`;
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as ObjectCannedACL,
    // Make sure object is readable by everyone
    CacheControl: 'public, max-age=86400',
  };

  try {
    console.log(`Starting S3 upload for room image: ${params.Key}`);
    console.log(`File mimetype: ${file.mimetype}, size: ${file.buffer.length} bytes`);
    
    // Use the Upload utility for better handling of large files
    const upload = new Upload({
      client: s3Client,
      params: params,
    });

    const result = await upload.done();
    console.log(`Successfully uploaded file: ${params.Key}`);
    
    // Explicitly set ACL again to ensure it's public-read
    try {
      await s3Client.send(new PutObjectAclCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ACL: 'public-read'
      }));
      console.log(`Successfully set ACL to public-read for ${key}`);
    } catch (aclError) {
      console.warn(`Warning: Could not set ACL. This might affect public access:`, aclError);
    }

    // Construct URL in a consistent way
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log(`Generated file URL: ${fileUrl}`);
    
    return fileUrl;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to delete a file from S3
async function deleteFileFromS3(fileUrl: string): Promise<void> {
  // Validate S3 configuration
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not configured in environment variables");
  }

  try {
    // Extract the key from the URL
    const urlPath = new URL(fileUrl).pathname;
    const key = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`Successfully deleted file: ${key}`);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Get rooms for a property using raw Prisma query
export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    
    // Handle both direct /rooms call and nested /properties/:propertyId/rooms
    if (propertyId) {
      console.log(`Fetching rooms for property: ${propertyId}`);
      
      // Validate property ID
      if (isNaN(Number(propertyId))) {
        console.log(`Invalid property ID format: ${propertyId}`);
        res.status(400).json({ message: "Valid property ID is required" });
        return;
      }
    } else {
      console.log('Fetching all rooms (no property filter)');
    }

    const numericPropertyId = propertyId ? Number(propertyId) : null;
    console.log(`Parsed numeric property ID: ${numericPropertyId}`);

    // Different behavior based on if propertyId exists
    if (numericPropertyId) {
      // First check if property exists
      try {
        console.log(`Checking if property ${numericPropertyId} exists`);
        const propertyQuery = Prisma.sql`
          SELECT id, name FROM "Property" WHERE id = ${numericPropertyId}
        `;
        
        const properties = await prisma.$queryRaw(propertyQuery);
        console.log('Property query result:', JSON.stringify(properties));
        
        if (!properties || !Array.isArray(properties) || properties.length === 0) {
          console.log(`Property ${numericPropertyId} not found`);
          res.status(404).json({ message: "Property not found" });
          return;
        }
        
        console.log(`Property ${numericPropertyId} found, proceeding to fetch rooms`);
      } catch (propertyError) {
        console.error(`Error checking if property ${numericPropertyId} exists:`, propertyError);
        res.status(500).json({ message: "Error checking property", error: propertyError });
        return;
      }
      
      // Get all rooms for this property
      try {
        console.log(`Building query to fetch rooms for property ${numericPropertyId}`);
        const roomsQuery = Prisma.sql`
          SELECT r.id, r.name, r."pricePerMonth", r."securityDeposit", r."isAvailable", r."photoUrls", r."propertyId", 
            p.name as "propertyName"
          FROM "Room" r
          JOIN "Property" p ON r."propertyId" = p.id
          WHERE r."propertyId" = ${numericPropertyId}
        `;
        
        console.log('Executing rooms query...');
        const rooms = await prisma.$queryRaw(roomsQuery);
        console.log(`Found ${Array.isArray(rooms) ? rooms.length : 0} rooms for property ${numericPropertyId}`);
        res.json(rooms || []);
      } catch (error) {
        console.error(`Error fetching rooms for property ${numericPropertyId}:`, error);
        res.status(500).json({ 
          message: "Error fetching rooms", 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    } else {
      // Get ALL rooms when no propertyId is provided
      try {
        console.log('Building query to fetch all rooms');
        const roomsQuery = Prisma.sql`
          SELECT r.id, r.name, r."pricePerMonth", r."securityDeposit", r."isAvailable", r."photoUrls", r."propertyId", 
            p.name as "propertyName"
          FROM "Room" r
          JOIN "Property" p ON r."propertyId" = p.id
        `;
        
        console.log('Executing all rooms query...');
        const rooms = await prisma.$queryRaw(roomsQuery);
        console.log(`Found ${Array.isArray(rooms) ? rooms.length : 0} rooms in total`);

        // Return empty array if no rooms found
        res.json(rooms || []);
      } catch (error) {
        console.error("Error fetching all rooms:", error);
        res.status(500).json({ 
          message: "Error fetching rooms", 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  } catch (error: any) {
    console.error("Error retrieving rooms:", error);
    res.status(500).json({ message: `Error retrieving rooms: ${error.message}` });
  }
};

// Get a single room by ID with property and location information
export const getRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid room ID" });
      return;
    }

    const numericId = Number(id);

    // Use raw query to get room with property and location information in one query
    const roomQuery = Prisma.sql`
      SELECT 
        r.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'locationId', p."locationId",
          'location', json_build_object(
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
          )
        ) as property
      FROM "Room" r
      JOIN "Property" p ON r."propertyId" = p.id
      JOIN "Location" l ON p."locationId" = l.id
      WHERE r.id = ${numericId}
    `;

    const rooms = await prisma.$queryRaw(roomQuery) as any[];
    const room = rooms[0];

    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    res.json(room);
  } catch (error: any) {
    console.error("Error retrieving room:", error);
    res.status(500).json({ message: `Error retrieving room: ${error.message}` });
  }
};

// Create a new room using raw Prisma queries for better control
export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Creating room, request body:", req.body);
    console.log("Creating room, files:", req.files);
    console.log("Request headers:", req.headers);
    
    // Handle files safely - use an empty array if no files
    const files = req.files as Express.Multer.File[] || [];
    console.log(`Received ${files.length} files for room`);
    
    // Get propertyId from either params (for the new flat route) or body (for backward compatibility)
    let propertyId = req.params.propertyId || req.body.propertyId;
    
    const {
      name,
      description,
      pricePerMonth,
      securityDeposit,
      squareFeet,
      isAvailable,
      availableFrom,
      roomType,
      capacity,
      amenities,
      features,
    } = req.body;

    console.log("Parsed room data:", {
      propertyId,
      name,
      description,
      pricePerMonth,
      securityDeposit,
      squareFeet,
      isAvailable,
      availableFrom,
      roomType,
      capacity,
      amenities,
      features,
    });
    
    // Validate required fields
    if (!propertyId || !name || !pricePerMonth) {
      console.log("Missing required fields:", {
        propertyId: !propertyId,
        name: !name,
        pricePerMonth: !pricePerMonth,
      });
      res.status(400).json({ 
        message: "Missing required fields",
        missingFields: {
          propertyId: !propertyId,
          name: !name,
          pricePerMonth: !pricePerMonth,
        }
      });
      return;
    }

    // Check if property exists using raw query
    const propertyQuery = Prisma.sql`
      SELECT id FROM "Property" WHERE id = ${Number(propertyId)}
    `;
    
    const properties = await prisma.$queryRaw(propertyQuery);
    console.log("Found property:", properties);
    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      console.log("Property not found for ID:", propertyId);
      res.status(404).json({ message: "Property not found" });
      return;
    }

    // Handle file uploads
    let photoUrls: string[] = [];
    if (files.length > 0) {
      try {
        // Upload files in parallel
        photoUrls = await Promise.all(
          files.map(file => uploadFileToS3(file))
        );
        console.log('Successfully uploaded room photos:', photoUrls);
      } catch (error) {
        console.error("Error uploading files to S3:", error);
        res.status(500).json({ 
          message: "Error uploading files to S3",
          error: error instanceof Error ? error.message : String(error)
        });
        return;
      }
    }

    // Process arrays for amenities and features
    const processedAmenities = Array.isArray(amenities) 
      ? amenities 
      : typeof amenities === "string"
        ? amenities.split(",")
        : [];
        
    const processedFeatures = Array.isArray(features)
      ? features
      : typeof features === "string"
        ? features.split(",")
        : [];

    // Parse and validate other fields
    const numericPropertyId = Number(propertyId);
    const numericPricePerMonth = parseFloat(pricePerMonth) || 0;
    const numericSecurityDeposit = parseFloat(securityDeposit) || 0;
    const numericSquareFeet = squareFeet ? parseInt(squareFeet) : null;
    const parsedAvailableFrom = availableFrom ? new Date(availableFrom) : null;
    
    // Ensure roomType is properly handled as an enum value
    let parsedRoomType: RoomType;
    if (!roomType || typeof roomType !== 'string') {
      parsedRoomType = RoomType.PRIVATE;
    } else if (Object.values(RoomType).includes(roomType as RoomType)) {
      // If it's a valid enum value string, use it directly
      parsedRoomType = roomType as RoomType;
    } else {
      // Default to PRIVATE for invalid values
      console.warn(`Invalid roomType value: ${roomType}, defaulting to PRIVATE`);
      parsedRoomType = RoomType.PRIVATE;
    }
    
    const numericCapacity = parseInt(capacity) || 1;
    const parsedIsAvailable = isAvailable === "true" || isAvailable === true;
    
    console.log("Processed room data:", {
      numericPropertyId,
      numericPricePerMonth,
      numericSecurityDeposit,
      numericSquareFeet,
      parsedAvailableFrom,
      parsedRoomType,
      numericCapacity,
      parsedIsAvailable,
      processedAmenities,
      processedFeatures,
    });

    try {
      // Create room with raw SQL for better control and performance
      const createRoomQuery = Prisma.sql`
        INSERT INTO "Room" (
          "propertyId", 
          "name", 
          "description", 
          "photoUrls", 
          "pricePerMonth", 
          "securityDeposit", 
          "squareFeet", 
          "isAvailable", 
          "availableFrom", 
          "roomType", 
          "capacity", 
          "amenities", 
          "features",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${numericPropertyId},
          ${name},
          ${description || null},
          ${photoUrls},
          ${numericPricePerMonth},
          ${numericSecurityDeposit},
          ${numericSquareFeet},
          ${parsedIsAvailable},
          ${parsedAvailableFrom},
          ${parsedRoomType}::"RoomType",
          ${numericCapacity},
          ${processedAmenities},
          ${processedFeatures},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING *
      `;

      const newRooms = await prisma.$queryRaw<any[]>(createRoomQuery);
      const newRoom = newRooms[0];

      // After creating the room, update the associated property to ensure proper linking
      try {
        // Get existing property data
        const property = await prisma.property.findUnique({
          where: { id: numericPropertyId }
        });
        
        if (property) {
          console.log(`Ensuring room ${newRoom.id} is linked to property ${numericPropertyId}`);
          // This will ensure the room is properly linked in the database relationship
          await prisma.property.update({
            where: { id: numericPropertyId },
            data: { 
              // The relation name in the schema is 'rooms' (lowercase plural)
              rooms: { connect: { id: newRoom.id } }
            }
          });
        }
      } catch (linkError) {
        // Don't fail if the linking update has issues, just log it
        console.warn("Room created but property linking step had issues:", linkError);
      }

      console.log("Room created successfully:", newRoom);
      res.status(201).json(newRoom);
    } catch (roomError: any) {
      console.error("Error creating room:", roomError);
      res.status(500).json({ 
        message: `Error creating room: ${roomError.message}`,
        details: roomError
      });
    }
  } catch (err: any) {
    console.error("Unhandled error in createRoom:", err);
    res.status(500).json({ message: `Error creating room: ${err.message}` });
  }
};

// Update room with raw Prisma queries
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const roomId = Number(id);
    console.log(`Updating room ${roomId}, request body:`, req.body);
    
    // Check if room exists using raw query
    const roomQuery = Prisma.sql`
      SELECT * FROM "Room" WHERE id = ${roomId}
    `;
    
    const rooms = await prisma.$queryRaw(roomQuery);
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    
    const existingRoom = rooms[0] as any;

    // Handle file uploads if any
    const files = req.files as Express.Multer.File[] || [];
    let photoUrls = existingRoom.photoUrls || [];
    
    if (files.length > 0) {
      try {
        // Upload new files
        const newPhotoUrls = await Promise.all(
          files.map(file => uploadFileToS3(file))
        );
        
        // Replace or append photos based on request
        if (req.body.replacePhotos === 'true') {
          // Delete existing photos from S3 if replace is specified
          if (photoUrls.length > 0) {
            try {
              await Promise.all(
                photoUrls.map((url: string) => deleteFileFromS3(url))
              );
            } catch (deleteError) {
              console.warn("Error deleting old photos:", deleteError);
              // Continue with the update despite deletion errors
            }
          }
          photoUrls = newPhotoUrls;
        } else {
          // Append new photos to existing ones
          photoUrls = [...photoUrls, ...newPhotoUrls];
        }
      } catch (uploadError) {
        console.error("Error uploading files to S3:", uploadError);
        res.status(500).json({ 
          message: "Error uploading files to S3",
          error: uploadError instanceof Error ? uploadError.message : String(uploadError)
        });
        return;
      }
    }

    // Extract room data
    const {
      name,
      description,
      pricePerMonth,
      securityDeposit,
      squareFeet,
      isAvailable,
      availableFrom,
      roomType,
      capacity,
      amenities,
      features,
    } = req.body;

    // Build SET clause dynamically
    let setClauses: Prisma.Sql[] = [];
    let params: any[] = [];

    // Handle all fields with proper type casting
    if (name !== undefined) {
      setClauses.push(Prisma.sql`"name" = ${name}`);
    }
    
    if (description !== undefined) {
      setClauses.push(Prisma.sql`"description" = ${description}`);
    }
    
    // Always update photoUrls in case they changed
    setClauses.push(Prisma.sql`"photoUrls" = ${photoUrls}`);
    
    // Handle numeric fields
    if (pricePerMonth !== undefined) {
      const parsedPrice = parseFloat(pricePerMonth) || existingRoom.pricePerMonth;
      setClauses.push(Prisma.sql`"pricePerMonth" = ${parsedPrice}`);
    }
    
    if (securityDeposit !== undefined) {
      const parsedDeposit = parseFloat(securityDeposit) || existingRoom.securityDeposit;
      setClauses.push(Prisma.sql`"securityDeposit" = ${parsedDeposit}`);
    }
    
    if (squareFeet !== undefined) {
      const parsedSquareFeet = parseInt(squareFeet) || existingRoom.squareFeet;
      setClauses.push(Prisma.sql`"squareFeet" = ${parsedSquareFeet}`);
    }
    
    if (capacity !== undefined) {
      const parsedCapacity = parseInt(capacity) || existingRoom.capacity;
      setClauses.push(Prisma.sql`"capacity" = ${parsedCapacity}`);
    }
    
    // Handle boolean fields
    if (isAvailable !== undefined) {
      const parsedIsAvailable = isAvailable === true || isAvailable === "true";
      setClauses.push(Prisma.sql`"isAvailable" = ${parsedIsAvailable}`);
    }
    
    // Handle date fields
    if (availableFrom !== undefined) {
      const parsedDate = availableFrom ? new Date(availableFrom) : null; 
      setClauses.push(Prisma.sql`"availableFrom" = ${parsedDate}`);
    }
    
    // Handle enum fields
    if (roomType !== undefined) {
      setClauses.push(Prisma.sql`"roomType" = ${roomType}::"RoomType"`);
    }
    
    // Handle array fields
    if (amenities !== undefined) {
      const processedAmenities = Array.isArray(amenities) 
        ? amenities 
        : typeof amenities === "string"
          ? amenities.split(",")
          : existingRoom.amenities;
          
      setClauses.push(Prisma.sql`"amenities" = ${processedAmenities}`);
    }
    
    if (features !== undefined) {
      const processedFeatures = Array.isArray(features)
        ? features
        : typeof features === "string"
          ? features.split(",")
          : existingRoom.features;
          
      setClauses.push(Prisma.sql`"features" = ${processedFeatures}`);
    }
    
    // No need to set updatedAt manually
    // Prisma will handle this automatically

    try {
      // Only update if there are fields to update
      if (setClauses.length > 0) {
        // Construct the complete update query
        const updateQuery = Prisma.sql`
          UPDATE "Room"
          SET ${Prisma.join(setClauses, ', ')}
          WHERE id = ${roomId}
          RETURNING *
        `;

        const updatedRooms = await prisma.$queryRaw<any[]>(updateQuery);
        const updatedRoom = updatedRooms[0];

        console.log("Room updated successfully:", updatedRoom);
        res.json(updatedRoom);
      } else {
        // Nothing to update, return the existing room
        res.json(existingRoom);
      }
    } catch (roomError: any) {
      console.error("Error updating room:", roomError);
      res.status(500).json({ 
        message: `Error updating room: ${roomError.message}`,
        details: roomError
      });
    }
  } catch (err: any) {
    console.error("Unhandled error in updateRoom:", err);
    res.status(500).json({ message: `Error updating room: ${err.message}` });
  }
};

// Delete room with raw Prisma queries for complete control
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const roomId = Number(id);
    console.log(`Deleting room ${roomId}`);
    
    // Check if room exists using raw query
    const roomQuery = Prisma.sql`
      SELECT * FROM "Room" WHERE id = ${roomId}
    `;
    
    const rooms = await prisma.$queryRaw(roomQuery);
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    
    const existingRoom = rooms[0] as any;

    // Delete all photos from S3 first
    if (existingRoom.photoUrls && existingRoom.photoUrls.length > 0) {
      try {
        await Promise.all(
          existingRoom.photoUrls.map((url: string) => deleteFileFromS3(url))
        );
        console.log('Successfully deleted all room photos from S3');
      } catch (deleteError) {
        console.warn("Error deleting photos from S3:", deleteError);
        // Continue with deletion despite S3 errors
      }
    }

    // Delete the room using raw query
    await prisma.$executeRaw`
      DELETE FROM "Room" WHERE id = ${roomId}
    `;

    console.log(`Room ${roomId} deleted successfully`);
    res.json({ message: "Room deleted successfully", id: roomId });
  } catch (err: any) {
    console.error("Error deleting room:", err);
    res.status(500).json({ 
      message: `Error deleting room: ${err.message}`,
      error: err
    });
  }
};