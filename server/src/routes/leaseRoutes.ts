import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getLeasePayments, getLeases, getPropertyLeases } from "../controllers/leaseControllers";

const router = express.Router();

// Property ID is already available from the parent route (/properties/:propertyId/leases)
// Use getPropertyLeases instead of getLeases to properly handle property-specific leases
router.get("/", authMiddleware(["manager", "tenant"]), getPropertyLeases);
router.get(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  getLeasePayments
);

export default router;