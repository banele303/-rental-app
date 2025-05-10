import express from "express";
import multer from 'multer';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyControllers";
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom } from "../controllers/roomControllers";
import { getPropertyLeases } from "../controllers/leaseControllers";

import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);

// Add flat routes for rooms - specific routes must come before parameterized routes
router.get("/rooms/single/:id", getRoom);
router.get("/rooms/:propertyId", getRooms);
router.post("/rooms/:propertyId", authMiddleware(["admin", "manager"]), upload.array("photos", 10), createRoom);
router.put("/rooms/:id", authMiddleware(["admin", "manager"]), upload.array("photos", 10), updateRoom);
router.delete("/rooms/:id", authMiddleware(["admin", "manager"]), deleteRoom);

// Lease routes
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