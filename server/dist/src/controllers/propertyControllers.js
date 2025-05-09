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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getProperty = exports.getProperties = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const roomControllers_1 = require("./roomControllers");
const wkt_1 = require("@terraformer/wkt");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
// Properly configure S3 client with credentials
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
        const key = `properties/${uniquePrefix}-${safeFileName}`;
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
            console.log(`Starting S3 upload for file: ${params.Key}`);
            console.log(`File mimetype: ${file.mimetype}, size: ${file.buffer.length} bytes`);
            // Use the Upload utility for better handling of large files
            const upload = new lib_storage_1.Upload({
                client: s3Client,
                params: params,
            });
            const result = yield upload.done();
            console.log(`Successfully uploaded file: ${params.Key}`);
            // Explicitly set ACL again to ensure it's public-read
            // This helps in some cases where the initial upload doesn't properly set the ACL
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
            // Using the S3 website endpoint format for better compatibility
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
// // Helper function to upload file to S3
// async function uploadFileToS3(file: Express.Multer.File): Promise<string> {
//   // Validate S3 configuration
//   if (!process.env.AWS_BUCKET_NAME) {
//     throw new Error("AWS_BUCKET_NAME is not configured in environment variables");
//   }
//   if (!process.env.AWS_REGION) {
//     throw new Error("AWS_REGION is not configured in environment variables");
//   }
//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: `properties/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     ACL: 'public-read' as ObjectCannedACL,
//   };
//   try {
//     const upload = new Upload({
//       client: s3Client,
//       params: params,
//     });
//     await upload.done();
//     console.log(`Successfully uploaded file: ${params.Key}`);
//     return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
//   } catch (error) {
//     console.error('Error uploading to S3:', error);
//     throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`);
//   }
// }
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
const getProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { favoriteIds, priceMin, priceMax, beds, baths, propertyType, squareFeetMin, squareFeetMax, amenities, availableFrom, latitude, longitude, } = req.query;
        let whereConditions = [];
        if (favoriteIds) {
            const favoriteIdsArray = favoriteIds.split(",").map(Number);
            whereConditions.push(client_1.Prisma.sql `p.id IN (${client_1.Prisma.join(favoriteIdsArray)})`);
        }
        if (priceMin) {
            whereConditions.push(client_1.Prisma.sql `p."pricePerMonth" >= ${Number(priceMin)}`);
        }
        if (priceMax) {
            whereConditions.push(client_1.Prisma.sql `p."pricePerMonth" <= ${Number(priceMax)}`);
        }
        if (beds && beds !== "any") {
            whereConditions.push(client_1.Prisma.sql `p.beds >= ${Number(beds)}`);
        }
        if (baths && baths !== "any") {
            whereConditions.push(client_1.Prisma.sql `p.baths >= ${Number(baths)}`);
        }
        if (squareFeetMin) {
            whereConditions.push(client_1.Prisma.sql `p."squareFeet" >= ${Number(squareFeetMin)}`);
        }
        if (squareFeetMax) {
            whereConditions.push(client_1.Prisma.sql `p."squareFeet" <= ${Number(squareFeetMax)}`);
        }
        if (propertyType && propertyType !== "any") {
            whereConditions.push(client_1.Prisma.sql `p."propertyType" = ${propertyType}::"PropertyType"`);
        }
        if (amenities && amenities !== "any") {
            const amenitiesArray = amenities.split(",");
            whereConditions.push(client_1.Prisma.sql `p.amenities @> ${amenitiesArray}`);
        }
        if (availableFrom && availableFrom !== "any") {
            const availableFromDate = typeof availableFrom === "string" ? availableFrom : null;
            if (availableFromDate) {
                const date = new Date(availableFromDate);
                if (!isNaN(date.getTime())) {
                    whereConditions.push(client_1.Prisma.sql `EXISTS (
              SELECT 1 FROM "Lease" l 
              WHERE l."propertyId" = p.id 
              AND l."startDate" <= ${date.toISOString()}
            )`);
                }
            }
        }
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const radiusInKilometers = 1000;
            const degrees = radiusInKilometers / 111; // Converts kilometers to degrees
            whereConditions.push(client_1.Prisma.sql `ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`);
        }
        const completeQuery = client_1.Prisma.sql `
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
      ${whereConditions.length > 0
            ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(whereConditions, " AND ")}`
            : client_1.Prisma.empty}
    `;
        const properties = yield prisma.$queryRaw(completeQuery);
        res.json(properties.map((property) => (Object.assign({}, property))));
    }
    catch (error) {
        console.error("Error retrieving properties:", error);
        res
            .status(500)
            .json({ message: `Error retrieving properties: ${error.message}` });
    }
});
exports.getProperties = getProperties;
const getProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const propertyId = Number(id);
        // Fetch property by ID with location and synthetic room data
        const property = yield prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                location: true,
                // Include actual rooms if they exist
                rooms: true
            },
        });
        if (!property) {
            res.status(404).json({ message: "Property not found" });
            return;
        }
        // Convert coordinates to GeoJSON format if available
        let coordinates = null;
        // Use type assertion to tell TypeScript that coordinates exists on location
        if (property.location && property.location.coordinates) {
            try {
                const wktGeometry = property.location.coordinates.toString();
                coordinates = (0, wkt_1.wktToGeoJSON)(wktGeometry);
            }
            catch (error) {
                console.error("Error converting coordinates:", error);
            }
        }
        // Check if we have real rooms data
        let rooms = property.rooms || [];
        // If we don't have any rooms, create a synthetic one based on the property
        if (rooms.length === 0) {
            // Generate a synthetic room from the property data for backwards compatibility
            const syntheticRoom = {
                id: propertyId * 1000, // Create a unique ID for the room
                propertyId: propertyId,
                name: property.name || 'Default Room',
                description: property.description || 'No description available',
                pricePerMonth: property.pricePerMonth || 0,
                securityDeposit: property.securityDeposit || 0,
                squareFeet: property.squareFeet || 0,
                photoUrls: property.photoUrls || [],
                isAvailable: true,
                roomType: roomControllers_1.RoomType.PRIVATE,
                capacity: 1,
                amenities: property.amenities || [],
                features: property.highlights || [],
                availableFrom: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            console.log('Created synthetic room from property:', syntheticRoom);
            rooms = [syntheticRoom];
        }
        // Return property with coordinates and rooms
        const propertyWithRooms = Object.assign(Object.assign({}, property), { rooms: rooms, location: Object.assign(Object.assign({}, property.location), { coordinates }) });
        console.log(`Returning property ${propertyId} with ${rooms.length} rooms`);
        res.json(propertyWithRooms);
    }
    catch (err) {
        console.error("Error fetching property:", err);
        res.status(500).json({ message: `Error fetching property: ${err.message}` });
    }
});
exports.getProperty = getProperty;
const createProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log("Creating property, request body:", req.body);
        // Handle files safely - use an empty array if no files
        const files = req.files || [];
        console.log(`Received ${files.length} files`);
        const _c = req.body, { address, city, state, country, postalCode, managerCognitoId } = _c, propertyData = __rest(_c, ["address", "city", "state", "country", "postalCode", "managerCognitoId"]);
        // Validate required fields - state is now optional
        if (!address || !city || !country || !managerCognitoId) {
            res.status(400).json({
                message: "Missing required fields",
                missingFields: {
                    address: !address,
                    city: !city,
                    country: !country,
                    postalCode: !postalCode,
                    managerCognitoId: !managerCognitoId
                }
            });
            return;
        }
        // Handle file uploads
        let photoUrls = [];
        if (files.length > 0) {
            try {
                // Upload files in parallel
                photoUrls = yield Promise.all(files.map(file => uploadFileToS3(file)));
                console.log('Successfully uploaded photos:', photoUrls);
            }
            catch (error) {
                console.error("Error uploading files to S3:", error);
                res.status(500).json({
                    message: "Error uploading files to S3",
                    error: error instanceof Error ? error.message : String(error),
                    details: "Please check your AWS S3 configuration in the environment variables"
                });
                return;
            }
        }
        // Create location first
        try {
            // Construct address string dynamically based on available components
            let addressParts = [address, city];
            // Add state only if it's provided and valid
            if (state && state.trim() !== '') {
                addressParts.push(state);
            }
            // Add postal code if available
            if (postalCode && postalCode.trim() !== '') {
                addressParts.push(postalCode);
            }
            // Always add country
            addressParts.push(country);
            // Join parts into a single string
            const addressString = addressParts.join(', ');
            // Get coordinates from address using Google Maps Geocoding API
            const geocodingResponse = yield axios_1.default.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
            if (geocodingResponse.data.status === "OK" &&
                geocodingResponse.data.results[0]) {
                const { lat, lng } = geocodingResponse.data.results[0].geometry.location;
                // Create location using raw query
                const locationResult = yield prisma.$queryRaw `
          INSERT INTO "Location" ("address", "city", "state", "country", "postalCode", "coordinates")
          VALUES (
            ${address},
            ${city},
            ${state || 'N/A'},  -- Provide a default value if state is null
            ${country},
            ${postalCode || null},
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
          )
          RETURNING id
        `;
                if (!locationResult || locationResult.length === 0) {
                    throw new Error("Failed to create location");
                }
                const locationId = locationResult[0].id;
                // Parse property data safely
                try {
                    // Create property with proper type handling
                    const newProperty = yield prisma.property.create({
                        data: Object.assign(Object.assign({}, propertyData), { photoUrls, locationId: locationId, managerCognitoId, 
                            // Parse array fields
                            amenities: Array.isArray(propertyData.amenities)
                                ? propertyData.amenities
                                : typeof propertyData.amenities === "string"
                                    ? propertyData.amenities.split(",")
                                    : [], highlights: Array.isArray(propertyData.highlights)
                                ? propertyData.highlights
                                : typeof propertyData.highlights === "string"
                                    ? propertyData.highlights.split(",")
                                    : [], 
                            // Parse boolean fields
                            isPetsAllowed: propertyData.isPetsAllowed === "true", isParkingIncluded: propertyData.isParkingIncluded === "true", 
                            // Parse numeric fields
                            pricePerMonth: parseFloat(propertyData.pricePerMonth) || 0, securityDeposit: parseFloat(propertyData.securityDeposit) || 0, applicationFee: parseFloat(propertyData.applicationFee) || 0, beds: parseInt(propertyData.beds) || 1, baths: parseFloat(propertyData.baths) || 1, squareFeet: parseInt(propertyData.squareFeet) || 0 }),
                        include: {
                            location: true,
                            manager: true,
                        },
                    });
                    // Fetch the updated location to get coordinates
                    const updatedLocation = yield prisma.$queryRaw `
            SELECT 
              ST_X(coordinates::geometry) as x,
              ST_Y(coordinates::geometry) as y
            FROM "Location"
            WHERE id = ${locationId}
          `;
                    // Add coordinates to the response
                    const propertyWithCoordinates = Object.assign(Object.assign({}, newProperty), { location: Object.assign(Object.assign({}, newProperty.location), { coordinates: {
                                latitude: ((_a = updatedLocation[0]) === null || _a === void 0 ? void 0 : _a.y) || lat,
                                longitude: ((_b = updatedLocation[0]) === null || _b === void 0 ? void 0 : _b.x) || lng,
                            } }) });
                    console.log("Property created successfully:", propertyWithCoordinates);
                    res.status(201).json(propertyWithCoordinates);
                }
                catch (propertyError) {
                    console.error("Error creating property:", propertyError);
                    res.status(500).json({
                        message: `Error creating property: ${propertyError.message}`,
                        details: propertyError
                    });
                }
            }
            else {
                throw new Error("Could not geocode the address");
            }
        }
        catch (locationError) {
            console.error("Error creating location:", locationError);
            res.status(500).json({
                message: `Error creating location: ${locationError.message}`,
                details: locationError
            });
        }
    }
    catch (err) {
        console.error("Unhandled error in createProperty:", err);
        res
            .status(500)
            .json({ message: `Error creating property: ${err.message}` });
    }
});
exports.createProperty = createProperty;
// New function to update a property
const updateProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const propertyId = Number(id);
        console.log(`Updating property ${propertyId}, request body:`, req.body);
        // Check if property exists
        const existingProperty = yield prisma.property.findUnique({
            where: { id: propertyId },
            include: { location: true }
        });
        if (!existingProperty) {
            res.status(404).json({ message: "Property not found" });
            return;
        }
        // Handle authorization check - ensure user can edit this property
        const { managerCognitoId } = req.body;
        if (managerCognitoId && managerCognitoId !== existingProperty.managerCognitoId) {
            const isAdmin = req.headers['x-user-role'] === 'admin'; // Example authorization check
            if (!isAdmin) {
                res.status(403).json({ message: "Unauthorized to update this property" });
                return;
            }
        }
        // Extract location data
        const _b = req.body, { address, city, state, country, postalCode } = _b, propertyData = __rest(_b, ["address", "city", "state", "country", "postalCode"]);
        // Handle file uploads if any
        const files = req.files || [];
        let photoUrls = existingProperty.photoUrls || [];
        if (files.length > 0) {
            try {
                // Upload new files
                const newPhotoUrls = yield Promise.all(files.map(file => uploadFileToS3(file)));
                // Replace or append photos based on request
                if (req.body.replacePhotos === 'true') {
                    // Delete existing photos from S3 if replace is specified
                    if (photoUrls.length > 0) {
                        try {
                            yield Promise.all(photoUrls.map(url => deleteFileFromS3(url)));
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
                console.log('Updated photos:', photoUrls);
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
        // Update location if address info is provided
        if (address || city || country) {
            try {
                // Only geocode if address components changed
                const hasAddressChanged = (address && address !== existingProperty.location.address) ||
                    (city && city !== existingProperty.location.city) ||
                    (state && state !== existingProperty.location.state) ||
                    (country && country !== existingProperty.location.country) ||
                    (postalCode && postalCode !== existingProperty.location.postalCode);
                if (hasAddressChanged) {
                    // Build address string for geocoding
                    const addressParts = [
                        address || existingProperty.location.address,
                        city || existingProperty.location.city
                    ];
                    if (state || existingProperty.location.state) {
                        addressParts.push(state || existingProperty.location.state);
                    }
                    if (postalCode || existingProperty.location.postalCode) {
                        addressParts.push(postalCode || existingProperty.location.postalCode);
                    }
                    addressParts.push(country || existingProperty.location.country);
                    const addressString = addressParts.join(', ');
                    // Get coordinates from address using Google Maps Geocoding API
                    const geocodingResponse = yield axios_1.default.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
                    if (geocodingResponse.data.status === "OK" &&
                        geocodingResponse.data.results[0]) {
                        const { lat, lng } = geocodingResponse.data.results[0].geometry.location;
                        // Update location
                        yield prisma.$executeRaw `
              UPDATE "Location" 
              SET 
                "address" = ${address || existingProperty.location.address},
                "city" = ${city || existingProperty.location.city},
                "state" = ${state || existingProperty.location.state},
                "country" = ${country || existingProperty.location.country},
                "postalCode" = ${postalCode || existingProperty.location.postalCode},
                "coordinates" = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
              WHERE id = ${existingProperty.locationId}
            `;
                    }
                    else {
                        throw new Error("Could not geocode the updated address");
                    }
                }
                else {
                    // Update location without changing coordinates
                    yield prisma.location.update({
                        where: { id: existingProperty.locationId },
                        data: {
                            address: address || undefined,
                            city: city || undefined,
                            state: state || undefined,
                            country: country || undefined,
                            postalCode: postalCode || undefined,
                        },
                    });
                }
            }
            catch (locationError) {
                console.error("Error updating location:", locationError);
                res.status(500).json({
                    message: `Error updating location: ${locationError.message}`,
                    details: locationError
                });
                return;
            }
        }
        // Update property data
        try {
            // Prepare data with type handling
            const updateData = Object.assign(Object.assign({}, propertyData), { photoUrls });
            // Remove any invalid fields that shouldn't be sent to Prisma
            // 'propertyId' isn't a valid field in the Property schema
            if ('propertyId' in updateData) {
                console.log("Removing invalid propertyId field from property update data");
                delete updateData.propertyId;
            }
            // Handle array fields properly
            if (propertyData.amenities) {
                updateData.amenities = Array.isArray(propertyData.amenities)
                    ? propertyData.amenities
                    : typeof propertyData.amenities === "string"
                        ? propertyData.amenities.split(",")
                        : undefined;
            }
            if (propertyData.highlights) {
                updateData.highlights = Array.isArray(propertyData.highlights)
                    ? propertyData.highlights
                    : typeof propertyData.highlights === "string"
                        ? propertyData.highlights.split(",")
                        : undefined;
            }
            // Handle boolean fields
            if (propertyData.isPetsAllowed !== undefined) {
                updateData.isPetsAllowed = propertyData.isPetsAllowed === true || propertyData.isPetsAllowed === "true";
            }
            if (propertyData.isParkingIncluded !== undefined) {
                updateData.isParkingIncluded = propertyData.isParkingIncluded === true || propertyData.isParkingIncluded === "true";
            }
            // Handle numeric fields
            if (propertyData.pricePerMonth !== undefined) {
                updateData.pricePerMonth = parseFloat(propertyData.pricePerMonth) || existingProperty.pricePerMonth;
            }
            if (propertyData.securityDeposit !== undefined) {
                updateData.securityDeposit = parseFloat(propertyData.securityDeposit) || existingProperty.securityDeposit;
            }
            if (propertyData.applicationFee !== undefined) {
                updateData.applicationFee = parseFloat(propertyData.applicationFee) || existingProperty.applicationFee;
            }
            if (propertyData.beds !== undefined) {
                updateData.beds = parseInt(propertyData.beds) || existingProperty.beds;
            }
            if (propertyData.baths !== undefined) {
                updateData.baths = parseFloat(propertyData.baths) || existingProperty.baths;
            }
            if (propertyData.squareFeet !== undefined) {
                updateData.squareFeet = parseInt(propertyData.squareFeet) || existingProperty.squareFeet;
            }
            // For better debugging
            console.log("Prepared property update data:", JSON.stringify(updateData, null, 2));
            // Update the property
            const updatedProperty = yield prisma.property.update({
                where: { id: propertyId },
                data: updateData,
                include: {
                    location: true,
                    manager: true
                }
            });
            // Fetch the latest coordinates
            const coordinates = yield prisma.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${updatedProperty.location.id}`;
            const geoJSON = (0, wkt_1.wktToGeoJSON)(((_a = coordinates[0]) === null || _a === void 0 ? void 0 : _a.coordinates) || "");
            const longitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];
            const propertyWithCoordinates = Object.assign(Object.assign({}, updatedProperty), { location: Object.assign(Object.assign({}, updatedProperty.location), { coordinates: {
                        longitude,
                        latitude,
                    } }) });
            console.log("Property updated successfully:", propertyWithCoordinates);
            res.json(propertyWithCoordinates);
        }
        catch (propertyError) {
            console.error("Error updating property:", propertyError);
            res.status(500).json({
                message: `Error updating property: ${propertyError.message}`,
                details: propertyError
            });
        }
    }
    catch (err) {
        console.error("Unhandled error in updateProperty:", err);
        res.status(500).json({ message: `Error updating property: ${err.message}` });
    }
});
exports.updateProperty = updateProperty;
// New function to delete a property
const deleteProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const propertyId = Number(id);
        console.log(`Deleting property ${propertyId}`);
        // Extract authorization token
        const authHeader = req.headers.authorization;
        const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : null;
        // Validate token presence
        if (!token) {
            console.warn('Missing authorization token');
            res.status(401).json({ message: "Unauthorized - Missing authentication token" });
            return;
        }
        // You should verify the token here using your authentication system
        // For example, with AWS Cognito or JWT verification
        // const verifiedToken = await verifyAuthToken(token);
        // if (!verifiedToken.valid) {
        //   res.status(401).json({ message: "Unauthorized - Invalid token" });
        //   return;
        // }
        // Check if property exists
        const existingProperty = yield prisma.property.findUnique({
            where: { id: propertyId },
            include: { location: true }
        });
        if (!existingProperty) {
            res.status(404).json({ message: "Property not found" });
            return;
        }
        // Handle authorization check - ensure user can delete this property
        const managerCognitoId = req.query.managerCognitoId || req.body.managerCognitoId;
        if (managerCognitoId && managerCognitoId !== existingProperty.managerCognitoId) {
            const isAdmin = req.headers['x-user-role'] === 'admin'; // Example authorization check
            if (!isAdmin) {
                res.status(403).json({ message: "Unauthorized to delete this property" });
                return;
            }
        }
        // Delete all photos from S3 first
        if (existingProperty.photoUrls && existingProperty.photoUrls.length > 0) {
            try {
                yield Promise.all(existingProperty.photoUrls.map(url => deleteFileFromS3(url)));
                console.log('Successfully deleted all property photos from S3');
            }
            catch (deleteError) {
                console.warn("Error deleting photos from S3:", deleteError);
                // Continue with deletion despite S3 errors
            }
        }
        // Start a transaction to ensure both property and location are deleted
        yield prisma.$transaction((prismaClient) => __awaiter(void 0, void 0, void 0, function* () {
            // Delete any related records that depend on this property (example)
            try {
                // Delete related records first
                yield prismaClient.$executeRaw `DELETE FROM "Lease" WHERE "propertyId" = ${propertyId}`;
                yield prismaClient.$executeRaw `DELETE FROM "Application" WHERE "propertyId" = ${propertyId}`;
                // Delete the property
                yield prismaClient.property.delete({
                    where: { id: propertyId }
                });
                // Delete the location
                yield prismaClient.location.delete({
                    where: { id: existingProperty.locationId }
                });
            }
            catch (txError) {
                console.error('Transaction error:', txError);
                throw txError; // Re-throw to trigger rollback
            }
        }));
        console.log(`Property ${propertyId} deleted successfully`);
        res.json({ message: "Property deleted successfully", id: propertyId });
    }
    catch (err) {
        console.error("Error deleting property:", err);
        res.status(500).json({
            message: `Error deleting property: ${err.message}`,
            error: err
        });
    }
});
exports.deleteProperty = deleteProperty;
