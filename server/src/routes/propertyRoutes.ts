import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyControllers";
import { getRooms } from "../controllers/roomControllers";
import { getPropertyLeases } from "../controllers/leaseControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);

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
import { createRoom } from '../controllers/roomControllers';
import multer from 'multer';

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