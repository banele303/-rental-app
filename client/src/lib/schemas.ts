import * as z from "zod";
import { PropertyTypeEnum } from "@/lib/constants";

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
