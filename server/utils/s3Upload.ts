import "dotenv/config"
import { S3Client, type ObjectCannedACL, DeleteObjectCommand, PutObjectAclCommand } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import type { Express } from "express"
import type { Multer } from "multer"

// Properly configure S3 client with credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadFileToS3(file: Express.Multer.File): Promise<string> {
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

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read" as ObjectCannedACL,
    // Make sure object is readable by everyone
    CacheControl: "public, max-age=86400",
  }

  try {
    console.log(`Starting S3 upload for file: ${params.Key}`)
    console.log(`File mimetype: ${file.mimetype}, size: ${file.buffer.length} bytes`)

    // Use the Upload utility for better handling of large files
    const upload = new Upload({
      client: s3Client,
      params: params,
    })

    const result = await upload.done()
    console.log(`Successfully uploaded file: ${params.Key}`)

    // Explicitly set ACL again to ensure it's public-read
    // This helps in some cases where the initial upload doesn't properly set the ACL
    try {
      await s3Client.send(
        new PutObjectAclCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          ACL: "public-read",
        }),
      )
      console.log(`Successfully set ACL to public-read for ${key}`)
    } catch (aclError) {
      console.warn(`Warning: Could not set ACL. This might affect public access:`, aclError)
    }

    // Construct URL in a consistent way
    // Using the S3 website endpoint format for better compatibility
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    console.log(`Generated file URL: ${fileUrl}`)

    return fileUrl
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Helper function to delete a file from S3
export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  // Validate S3 configuration
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not configured in environment variables")
  }

  try {
    // Extract the key from the URL
    const urlPath = new URL(fileUrl).pathname
    const key = urlPath.startsWith("/") ? urlPath.substring(1) : urlPath

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }

    await s3Client.send(new DeleteObjectCommand(deleteParams))
    console.log(`Successfully deleted file: ${key}`)
  } catch (error) {
    console.error("Error deleting from S3:", error)
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : String(error)}`)
  }
}
