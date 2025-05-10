import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Get current user info
router.get("/me", authMiddleware(["manager", "tenant"]), async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role?.toLowerCase();

    if (!userId || !userRole) {
      res.status(400).json({ message: "Invalid user information" });
      return;
    }

    // Get user info based on role
    let userInfo;
    if (userRole === "manager") {
      userInfo = await prisma.manager.findUnique({
        where: { cognitoId: userId }
      });
    } else if (userRole === "tenant") {
      userInfo = await prisma.tenant.findUnique({
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
  } catch (error) {
    console.error("Error in /me endpoint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 