import express from "express";
import multer from 'multer';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyControllers";
import { getRooms, createRoom } from "../controllers/roomControllers";
import { getPropertyLeases } from "../controllers/leaseControllers";

import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getProperties);

// Override the default getProperty handler to include rooms
router.get("/:id", async (req, res) => {
  try {
    // First get the property data using the existing controller
    await getProperty(req, res);
    
    // The response has already been sent by getProperty
    // But we'll add additional logic in the propertyController to include rooms
  } catch (error) {
    console.error("Error in custom property handler:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to fetch property with rooms" });
    }
  }
});

// Add nested routes for rooms and leases
router.get("/:propertyId/rooms", getRooms);
router.get("/:propertyId/leases", getPropertyLeases);

router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty
);
router.put(
  "/:id",
  authMiddleware(["manager"]),
  upload.array("photos"),
  updateProperty
);
router.delete(
  "/:id",
  authMiddleware(["manager"]),
  deleteProperty
);

// Special endpoint for room creation to work around API Gateway limitations

// Setup multer for room photos
const roomStorage = multer.memoryStorage();
const roomUpload = multer({ 
  storage: roomStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  } 
});

router.post(
  "/:propertyId/create-room",
  authMiddleware(["admin", "manager"]),
  roomUpload.array('photos', 10),
  createRoom
);

export default router;