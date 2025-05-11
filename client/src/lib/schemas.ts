import * as z from "zod";
import { PropertyTypeEnum, RoomTypeEnum } from "@/lib/constants";

export const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pricePerMonth: z.number().min(0, "Price must be positive"),
  securityDeposit: z.number().min(0, "Security deposit must be positive"),
  applicationFee: z.number().min(0, "Application fee must be positive"),
  isPetsAllowed: z.boolean(),
  isParkingIncluded: z.boolean(),
  photoUrls: z.any(), // This will be handled by the file input
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
  highlights: z.array(z.string()).min(1, "At least one highlight is required"),
  propertyType: z.nativeEnum(PropertyTypeEnum),
  beds: z.number().min(1, "At least one bed is required"),
  baths: z.number().min(1, "At least one bath is required"),
  squareFeet: z.number().min(1, "Square footage is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

export const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  message: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;


// Add these to your lib/schemas.ts file



// Room form data schema
export const roomSchema = z.object({
  propertyId: z.number().or(z.string().transform(val => parseInt(val))),
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
  pricePerMonth: z.number().min(1, "Price is required")
    .or(z.string().transform(val => parseFloat(val)).refine(val => val >= 1, { message: "Price is required" })),
  securityDeposit: z.number().or(z.string().transform(val => parseFloat(val))).default(0),
  squareFeet: z.number().or(z.string().transform(val => parseInt(val))).optional().nullable(),
  isAvailable: z.boolean().or(z.string().transform(val => val === "true")).default(true),
  availableFrom: z.date().or(z.string().transform(val => new Date(val))).optional().nullable(),
  roomType: z.nativeEnum(RoomTypeEnum).default(RoomTypeEnum.PRIVATE),
  capacity: z.number().min(1).or(z.string().transform(val => parseInt(val)).refine(val => val >= 1, { message: "Capacity must be at least 1" })).default(1),
  amenities: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  photoUrls: z.any().optional(), // handles File objects for upload
});

// Type for room form data
export type RoomFormData = z.infer<typeof roomSchema>;



export interface ApiProperty {
  id: number;
  name: string;
  description?: string | null;
  photoUrls: string[];
  pricePerMonth: number;
  securityDeposit?: number | null;
  applicationFee?: number | null;
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  propertyType: PropertyTypeEnum;
  beds: number;
  baths: number;
  squareFeet?: number | null;
  amenities: AmenityEnum[];
  highlights: HighlightEnum[];
  managerCognitoId: string;
  locationId: number;

  createdAt: string;
  updatedAt: string;
  // Add other potential fields like manager: ApiManager if included
}

export interface ApiRoom {
  id: number;
  propertyId: number;
  name: string;
  description?: string | null;
  photoUrls: string[];
  pricePerMonth: number;
  securityDeposit?: number | null;
  squareFeet?: number | null;
  isAvailable: boolean;
  availableFrom?: string | null;
  roomType: RoomTypeEnum;
  capacity?: number | null;
  amenities: AmenityEnum[];
  features: string[];
  createdAt: string;
  updatedAt: string;
  // Add property?: ApiProperty if included by the backend
}


