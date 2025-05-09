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

export default router;