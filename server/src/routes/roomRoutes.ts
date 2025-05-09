import express from 'express';
import multer from 'multer';
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom } from '../controllers/roomControllers';
import { authMiddleware } from "../middleware/authMiddleware";;

const router = express.Router();

// Setup multer for memory storage (for S3 uploads)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  } 
});

// Room routes
// Property ID is already available from the parent route (/properties/:propertyId/rooms)
router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', authMiddleware(['admin', 'manager']), upload.array('photos', 10), createRoom);
router.put('/:id', authMiddleware(['admin', 'manager']), upload.array('photos', 10), updateRoom);
router.delete('/:id', authMiddleware(['admin', 'manager']), deleteRoom);

// Direct access endpoint for room creation that doesn't rely on nested routes
// This is more likely to work with existing API Gateway configuration
router.post('/create-with-property/:propertyId', authMiddleware(['admin', 'manager']), upload.array('photos', 10), createRoom);

export default router;