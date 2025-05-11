import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });
    res.json(leases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving leases: ${error.message}` });
  }
};

export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
    res.json(payments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving lease payments: ${error.message}` });
  }
};

export const getPropertyLeases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { propertyId } = req.params;
    console.log(`Fetching leases for property ID: ${propertyId}`);
    
    if (!propertyId || isNaN(Number(propertyId))) {
      console.log("Invalid property ID:", propertyId);
      res.status(400).json({ message: "Invalid property ID" });
      return;
    }

    const leases = await prisma.lease.findMany({
      where: { propertyId: Number(propertyId) },
      include: {
        tenant: true
      }
    });
    
    console.log(`Found ${leases.length} leases for property ${propertyId}`);
    res.json(leases);
  } catch (error: any) {
    console.error("Error retrieving property leases:", error);
    res
      .status(500)
      .json({ message: `Error retrieving property leases: ${error.message}` });
  }
};