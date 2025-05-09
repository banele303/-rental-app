"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.updateRoom = exports.createRoom = exports.getRoom = exports.getRooms = exports.RoomType = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
// Define RoomType enum locally to match your Prisma schema
var RoomType;
(function (RoomType) {
    RoomType["PRIVATE"] = "PRIVATE";
    RoomType["SHARED"] = "SHARED";
    // Add other types as defined in your schema
})(RoomType || (exports.RoomType = RoomType = {}));
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const prisma = new client_1.PrismaClient();
// Configure S3 client with proper credentials
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
// Enhanced upload function with better error handling, double-check ACL, and consistent URL construction
function uploadFileToS3(file) {
    return __awaiter(this, void 0, void 0, function* () {
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
            ACL: 'public-read',
            // Make sure object is readable by everyone
            CacheControl: 'public, max-age=86400',
        };
        try {
            console.log(`Starting S3 upload for room image: ${params.Key}`);
            console.log(`File mimetype: ${file.mimetype}, size: ${file.buffer.length} bytes`);
            // Use the Upload utility for better handling of large files
            const upload = new lib_storage_1.Upload({
                client: s3Client,
                params: params,
            });
            const result = yield upload.done();
            console.log(`Successfully uploaded file: ${params.Key}`);
            // Explicitly set ACL again to ensure it's public-read
            try {
                yield s3Client.send(new client_s3_1.PutObjectAclCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key,
                    ACL: 'public-read'
                }));
                console.log(`Successfully set ACL to public-read for ${key}`);
            }
            catch (aclError) {
                console.warn(`Warning: Could not set ACL. This might affect public access:`, aclError);
            }
            // Construct URL in a consistent way
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            console.log(`Generated file URL: ${fileUrl}`);
            return fileUrl;
        }
        catch (error) {
            console.error('Error uploading to S3:', error);
            throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
// Helper function to delete a file from S3
function deleteFileFromS3(fileUrl) {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield s3Client.send(new client_s3_1.DeleteObjectCommand(deleteParams));
            console.log(`Successfully deleted file: ${key}`);
        }
        catch (error) {
            console.error('Error deleting from S3:', error);
            throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
// Get rooms for a property using raw Prisma query
const getRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { propertyId } = req.params;
        console.log("Getting rooms for property:", propertyId);
        if (!propertyId || isNaN(Number(propertyId))) {
            console.log("Invalid property ID:", propertyId);
            res.status(400).json({ message: "Invalid property ID" });
            return;
        }
        const numericPropertyId = Number(propertyId);
        // First check if property exists
        const propertyQuery = client_1.Prisma.sql `
      SELECT id FROM "Property" WHERE id = ${numericPropertyId}
    `;
        const properties = yield prisma.$queryRaw(propertyQuery);
        console.log("Found property:", properties);
        if (!properties || !Array.isArray(properties) || properties.length === 0) {
            console.log("Property not found for ID:", propertyId);
            res.status(404).json({ message: "Property not found" });
            return;
        }
        // Using raw query for better performance and flexibility
        const roomsQuery = client_1.Prisma.sql `
      SELECT r.*
      FROM "Room" r
      WHERE r."propertyId" = ${numericPropertyId}
      ORDER BY r."createdAt" DESC
    `;
        const rooms = yield prisma.$queryRaw(roomsQuery);
        console.log(`Found ${Array.isArray(rooms) ? rooms.length : 0} rooms for property ${propertyId}`);
        // Return empty array if no rooms found
        res.json(rooms || []);
    }
    catch (error) {
        console.error("Error retrieving rooms:", error);
        res.status(500).json({ message: `Error retrieving rooms: ${error.message}` });
    }
});
exports.getRooms = getRooms;
// Get a single room by ID with property and location information
const getRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ message: "Invalid room ID" });
            return;
        }
        const numericId = Number(id);
        // Use raw query to get room with property and location information in one query
        const roomQuery = client_1.Prisma.sql `
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
        const rooms = yield prisma.$queryRaw(roomQuery);
        const room = rooms[0];
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        res.json(room);
    }
    catch (error) {
        console.error("Error retrieving room:", error);
        res.status(500).json({ message: `Error retrieving room: ${error.message}` });
    }
});
exports.getRoom = getRoom;
// Create a new room using raw Prisma queries for better control
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Creating room, request body:", req.body);
        console.log("Creating room, files:", req.files);
        console.log("Request headers:", req.headers);
        // Handle files safely - use an empty array if no files
        const files = req.files || [];
        console.log(`Received ${files.length} files for room`);
        const { propertyId, name, description, pricePerMonth, securityDeposit, squareFeet, isAvailable, availableFrom, roomType, capacity, amenities, features, } = req.body;
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
        const propertyQuery = client_1.Prisma.sql `
      SELECT id FROM "Property" WHERE id = ${Number(propertyId)}
    `;
        const properties = yield prisma.$queryRaw(propertyQuery);
        console.log("Found property:", properties);
        if (!properties || !Array.isArray(properties) || properties.length === 0) {
            console.log("Property not found for ID:", propertyId);
            res.status(404).json({ message: "Property not found" });
            return;
        }
        // Handle file uploads
        let photoUrls = [];
        if (files.length > 0) {
            try {
                // Upload files in parallel
                photoUrls = yield Promise.all(files.map(file => uploadFileToS3(file)));
                console.log('Successfully uploaded room photos:', photoUrls);
            }
            catch (error) {
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
        let parsedRoomType;
        if (!roomType || typeof roomType !== 'string') {
            parsedRoomType = RoomType.PRIVATE;
        }
        else if (Object.values(RoomType).includes(roomType)) {
            // If it's a valid enum value string, use it directly
            parsedRoomType = roomType;
        }
        else {
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
            const createRoomQuery = client_1.Prisma.sql `
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
            const newRooms = yield prisma.$queryRaw(createRoomQuery);
            const newRoom = newRooms[0];
            console.log("Room created successfully:", newRoom);
            res.status(201).json(newRoom);
        }
        catch (roomError) {
            console.error("Error creating room:", roomError);
            res.status(500).json({
                message: `Error creating room: ${roomError.message}`,
                details: roomError
            });
        }
    }
    catch (err) {
        console.error("Unhandled error in createRoom:", err);
        res.status(500).json({ message: `Error creating room: ${err.message}` });
    }
});
exports.createRoom = createRoom;
// Update room with raw Prisma queries
const updateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const roomId = Number(id);
        console.log(`Updating room ${roomId}, request body:`, req.body);
        // Check if room exists using raw query
        const roomQuery = client_1.Prisma.sql `
      SELECT * FROM "Room" WHERE id = ${roomId}
    `;
        const rooms = yield prisma.$queryRaw(roomQuery);
        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        const existingRoom = rooms[0];
        // Handle file uploads if any
        const files = req.files || [];
        let photoUrls = existingRoom.photoUrls || [];
        if (files.length > 0) {
            try {
                // Upload new files
                const newPhotoUrls = yield Promise.all(files.map(file => uploadFileToS3(file)));
                // Replace or append photos based on request
                if (req.body.replacePhotos === 'true') {
                    // Delete existing photos from S3 if replace is specified
                    if (photoUrls.length > 0) {
                        try {
                            yield Promise.all(photoUrls.map((url) => deleteFileFromS3(url)));
                        }
                        catch (deleteError) {
                            console.warn("Error deleting old photos:", deleteError);
                            // Continue with the update despite deletion errors
                        }
                    }
                    photoUrls = newPhotoUrls;
                }
                else {
                    // Append new photos to existing ones
                    photoUrls = [...photoUrls, ...newPhotoUrls];
                }
            }
            catch (uploadError) {
                console.error("Error uploading files to S3:", uploadError);
                res.status(500).json({
                    message: "Error uploading files to S3",
                    error: uploadError instanceof Error ? uploadError.message : String(uploadError)
                });
                return;
            }
        }
        // Extract room data
        const { name, description, pricePerMonth, securityDeposit, squareFeet, isAvailable, availableFrom, roomType, capacity, amenities, features, } = req.body;
        // Build SET clause dynamically
        let setClauses = [];
        let params = [];
        // Handle all fields with proper type casting
        if (name !== undefined) {
            setClauses.push(client_1.Prisma.sql `"name" = ${name}`);
        }
        if (description !== undefined) {
            setClauses.push(client_1.Prisma.sql `"description" = ${description}`);
        }
        // Always update photoUrls in case they changed
        setClauses.push(client_1.Prisma.sql `"photoUrls" = ${photoUrls}`);
        // Handle numeric fields
        if (pricePerMonth !== undefined) {
            const parsedPrice = parseFloat(pricePerMonth) || existingRoom.pricePerMonth;
            setClauses.push(client_1.Prisma.sql `"pricePerMonth" = ${parsedPrice}`);
        }
        if (securityDeposit !== undefined) {
            const parsedDeposit = parseFloat(securityDeposit) || existingRoom.securityDeposit;
            setClauses.push(client_1.Prisma.sql `"securityDeposit" = ${parsedDeposit}`);
        }
        if (squareFeet !== undefined) {
            const parsedSquareFeet = parseInt(squareFeet) || existingRoom.squareFeet;
            setClauses.push(client_1.Prisma.sql `"squareFeet" = ${parsedSquareFeet}`);
        }
        if (capacity !== undefined) {
            const parsedCapacity = parseInt(capacity) || existingRoom.capacity;
            setClauses.push(client_1.Prisma.sql `"capacity" = ${parsedCapacity}`);
        }
        // Handle boolean fields
        if (isAvailable !== undefined) {
            const parsedIsAvailable = isAvailable === true || isAvailable === "true";
            setClauses.push(client_1.Prisma.sql `"isAvailable" = ${parsedIsAvailable}`);
        }
        // Handle date fields
        if (availableFrom !== undefined) {
            const parsedDate = availableFrom ? new Date(availableFrom) : null;
            setClauses.push(client_1.Prisma.sql `"availableFrom" = ${parsedDate}`);
        }
        // Handle enum fields
        if (roomType !== undefined) {
            setClauses.push(client_1.Prisma.sql `"roomType" = ${roomType}::"RoomType"`);
        }
        // Handle array fields
        if (amenities !== undefined) {
            const processedAmenities = Array.isArray(amenities)
                ? amenities
                : typeof amenities === "string"
                    ? amenities.split(",")
                    : existingRoom.amenities;
            setClauses.push(client_1.Prisma.sql `"amenities" = ${processedAmenities}`);
        }
        if (features !== undefined) {
            const processedFeatures = Array.isArray(features)
                ? features
                : typeof features === "string"
                    ? features.split(",")
                    : existingRoom.features;
            setClauses.push(client_1.Prisma.sql `"features" = ${processedFeatures}`);
        }
        // Add updatedAt timestamp
        setClauses.push(client_1.Prisma.sql `"updatedAt" = CURRENT_TIMESTAMP`);
        try {
            // Only update if there are fields to update
            if (setClauses.length > 0) {
                // Construct the complete update query
                const updateQuery = client_1.Prisma.sql `
          UPDATE "Room"
          SET ${client_1.Prisma.join(setClauses, ', ')}
          WHERE id = ${roomId}
          RETURNING *
        `;
                const updatedRooms = yield prisma.$queryRaw(updateQuery);
                const updatedRoom = updatedRooms[0];
                console.log("Room updated successfully:", updatedRoom);
                res.json(updatedRoom);
            }
            else {
                // Nothing to update, return the existing room
                res.json(existingRoom);
            }
        }
        catch (roomError) {
            console.error("Error updating room:", roomError);
            res.status(500).json({
                message: `Error updating room: ${roomError.message}`,
                details: roomError
            });
        }
    }
    catch (err) {
        console.error("Unhandled error in updateRoom:", err);
        res.status(500).json({ message: `Error updating room: ${err.message}` });
    }
});
exports.updateRoom = updateRoom;
// Delete room with raw Prisma queries for complete control
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const roomId = Number(id);
        console.log(`Deleting room ${roomId}`);
        // Check if room exists using raw query
        const roomQuery = client_1.Prisma.sql `
      SELECT * FROM "Room" WHERE id = ${roomId}
    `;
        const rooms = yield prisma.$queryRaw(roomQuery);
        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        const existingRoom = rooms[0];
        // Delete all photos from S3 first
        if (existingRoom.photoUrls && existingRoom.photoUrls.length > 0) {
            try {
                yield Promise.all(existingRoom.photoUrls.map((url) => deleteFileFromS3(url)));
                console.log('Successfully deleted all room photos from S3');
            }
            catch (deleteError) {
                console.warn("Error deleting photos from S3:", deleteError);
                // Continue with deletion despite S3 errors
            }
        }
        // Delete the room using raw query
        yield prisma.$executeRaw `
      DELETE FROM "Room" WHERE id = ${roomId}
    `;
        console.log(`Room ${roomId} deleted successfully`);
        res.json({ message: "Room deleted successfully", id: roomId });
    }
    catch (err) {
        console.error("Error deleting room:", err);
        res.status(500).json({
            message: `Error deleting room: ${err.message}`,
            error: err
        });
    }
});
exports.deleteRoom = deleteRoom;
