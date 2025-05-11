export type PropertyType = 'APARTMENT' | 'HOUSE' | 'CONDO' | 'TOWNHOUSE';

export interface Location {
  id: number;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    longitude: number;
    latitude: number;
  };
}

export interface Property {
  id: number;
  name: string;
  description?: string;
  propertyType: PropertyType;
  photoUrls: string[];
  beds: number;
  baths: number;
  squareFeet: number;
  pricePerMonth: number;
  securityDeposit?: number;
  applicationFee?: number;
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  amenities?: string[];
  highlights?: string[];
  averageRating?: number;
  numberOfReviews?: number;
  managerCognitoId: string;
  location: Location;
  locationId: number;
  createdAt: string;
  updatedAt: string;
} 