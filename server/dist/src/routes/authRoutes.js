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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Get current user info
router.get("/me", (0, authMiddleware_1.authMiddleware)(["manager", "tenant"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === null || _c === void 0 ? void 0 : _c.toLowerCase();
        if (!userId || !userRole) {
            res.status(400).json({ message: "Invalid user information" });
            return;
        }
        // Get user info based on role
        let userInfo;
        if (userRole === "manager") {
            userInfo = yield prisma.manager.findUnique({
                where: { cognitoId: userId }
            });
        }
        else if (userRole === "tenant") {
            userInfo = yield prisma.tenant.findUnique({
                where: { cognitoId: userId },
                include: { favorites: true }
            });
        }
        if (!userInfo) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({
            cognitoInfo: {
                userId: userId
            },
            userInfo: userInfo,
            userRole: userRole
        });
    }
    catch (error) {
        console.error("Error in /me endpoint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
