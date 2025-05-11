"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const roomControllers_1 = require("../controllers/roomControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
;
const router = express_1.default.Router({ mergeParams: true });
// Setup multer for memory storage (for S3 uploads)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
// Room routes
// Property ID is already available from the parent route (/properties/:propertyId/rooms)
router.get('/', roomControllers_1.getRooms);
router.get('/:id', roomControllers_1.getRoom);
router.post('/', (0, authMiddleware_1.authMiddleware)(['admin', 'manager']), upload.array('photos', 10), roomControllers_1.createRoom);
router.put('/:id', (0, authMiddleware_1.authMiddleware)(['admin', 'manager']), upload.array('photos', 10), roomControllers_1.updateRoom);
router.delete('/:id', (0, authMiddleware_1.authMiddleware)(['admin', 'manager']), roomControllers_1.deleteRoom);
exports.default = router;
