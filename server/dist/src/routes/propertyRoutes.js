"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const propertyControllers_1 = require("../controllers/propertyControllers");
const roomControllers_1 = require("../controllers/roomControllers");
const leaseControllers_1 = require("../controllers/leaseControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const router = express_1.default.Router();
router.get("/", propertyControllers_1.getProperties);
router.get("/:id", propertyControllers_1.getProperty);
// Add nested routes for rooms and leases
router.get("/:propertyId/rooms", roomControllers_1.getRooms);
router.get("/:propertyId/leases", leaseControllers_1.getPropertyLeases);
router.post("/", (0, authMiddleware_1.authMiddleware)(["manager"]), upload.array("photos"), propertyControllers_1.createProperty);
router.put("/:id", (0, authMiddleware_1.authMiddleware)(["manager"]), upload.array("photos"), propertyControllers_1.updateProperty);
router.delete("/:id", (0, authMiddleware_1.authMiddleware)(["manager"]), propertyControllers_1.deleteProperty);
// Special endpoint for room creation to work around API Gateway limitations
// Setup multer for room photos
const roomStorage = multer_1.default.memoryStorage();
const roomUpload = (0, multer_1.default)({
    storage: roomStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
router.post("/:propertyId/create-room", (0, authMiddleware_1.authMiddleware)(["admin", "manager"]), roomUpload.array('photos', 10), roomControllers_1.createRoom);
exports.default = router;
