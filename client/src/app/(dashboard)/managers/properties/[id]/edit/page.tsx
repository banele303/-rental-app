"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner"



// Define property types
interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface PropertyData {
  id: number;
  name: string;
  description: string;
  pricePerMonth: number;
  beds: number;
  baths: number;
  squareFeet: number;
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  location: PropertyLocation;
  photoUrls: string[];
  managerCognitoId?: string;
}

// Define the params type for the component

export default function EditProperty({ params }: any) {
  const router = useRouter();

  
  // Unwrap params using React.use() to handle Promise as suggested by Next.js
  const unwrappedParams = use(params) as { id: string };
  const propertyId = Number.parseInt(unwrappedParams.id);

  // State for storing the user's cognitoId
  const [cognitoId, setCognitoId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch the current user's cognitoId using AWS Amplify
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const user = await getCurrentUser();
        setCognitoId(user.userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
        // Handle authentication error (e.g., redirect to login page)
        toast("Please log in again to continue.");
        router.push("/auth/login");
      } finally {
        setIsLoadingUser(false);
      }
    }

    fetchCurrentUser();
  }, [router, toast]);

  // Fetch property details - use custom fetch instead of the RTK Query hook
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [isError, setIsError] = useState(false);

  // Function to fetch property details with authentication
  const fetchPropertyDetails = async (id: number) => {
    try {
      setIsLoadingProperty(true);

      // Get authentication token
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};

      if (!idToken) {
        throw new Error("Authentication failed");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${id}`,
        {
          headers: {
            Authorization: `Bearer ${idToken.toString()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch property details");
      }

      const data = await response.json();
      setProperty(data as PropertyData);
      setIsError(false);
    } catch (error) {
      console.error("Error fetching property:", error);
      setIsError(true);
      toast("Failed to load property details. Please try again.");
    } finally {
      setIsLoadingProperty(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerMonth: 0,
    beds: 0,
    baths: 0,
    squareFeet: 0,
    isPetsAllowed: false,
    isParkingIncluded: false,
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  // Fetch property when the component mounts and we have propertyId
  useEffect(() => {
    if (propertyId && !isNaN(propertyId)) {
      fetchPropertyDetails(propertyId);
    }
  }, [propertyId]);

  // Populate form with property data when loaded
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        description: property.description || "",
        pricePerMonth: property.pricePerMonth || 0,
        beds: property.beds || 0,
        baths: property.baths || 0,
        squareFeet: property.squareFeet || 0,
        isPetsAllowed: property.isPetsAllowed || false,
        isParkingIncluded: property.isParkingIncluded || false,
        address: property.location?.address || "",
        city: property.location?.city || "",
        state: property.location?.state || "",
        country: property.location?.country || "",
        postalCode: property.location?.postalCode || "",
      });
    }
  }, [property]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Make sure cognitoId exists before submitting
    if (!cognitoId) {
      setError("User authentication failed. Please log in again.");
      toast("User authentication failed. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Get authentication token from Amplify
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};

      if (!idToken) {
        throw new Error("Authentication failed. Please log in again.");
      }

      // Create FormData object for the API request
      const apiFormData = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        apiFormData.append(key, String(value));
      });

      // Add manager cognitoId
      apiFormData.append("managerCognitoId", cognitoId);

      // Add files if any
      if (files) {
        for (let i = 0; i < files.length; i++) {
          apiFormData.append("photos", files[i]);
        }
      }

      // Send update request with authentication header
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${propertyId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken.toString()}`,
          },
          body: apiFormData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update property");
      }

      // Show success toast
      toast("Your property has been successfully updated.");

      // Save a flag in localStorage to indicate we need to refresh the properties page
      localStorage.setItem("refreshPropertiesPage", "true");
      
      // Navigate back to properties dashboard on success
      router.push("/managers/properties");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast( "Update Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state if either user or property data is loading
  if (isLoadingUser || isLoadingProperty) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg text-gray-300">
            Loading property details...
          </span>
        </div>
      </div>
    );
  }

  // Handle authentication error
  if (!cognitoId) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Alert
          variant="destructive"
          className="bg-red-900/20 border-red-900 text-red-300 mb-6"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            Unable to verify your identity. Please log in again.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push("/auth/login")}
          variant="outline"
          className="border-[#2D3748] text-white hover:bg-[#2D3748] hover:text-white"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Alert
          variant="destructive"
          className="bg-red-900/20 border-red-900 text-red-300 mb-6"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load property details. Please try again later.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push("/dashboard/properties")}
          variant="outline"
          className="border-[#2D3748] text-white hover:bg-[#2D3748] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <Button
          onClick={() => router.push("/dashboard/properties")}
          variant="outline"
          className="border-[#2D3748] text-white hover:bg-[#2D3748] hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <h1 className="text-3xl font-bold text-white">Edit Property</h1>
        <p className="text-gray-400">Update your property details</p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="bg-red-900/20 border-red-900 text-red-300 mb-6"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-[#1E293B]/50 border border-[#2D3748] rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Property Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pricePerMonth" className="text-white">
                  Price per Month
                </Label>
                <Input
                  id="pricePerMonth"
                  name="pricePerMonth"
                  type="number"
                  value={formData.pricePerMonth}
                  onChange={handleChange}
                  required
                  className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="beds" className="text-white">
                  Beds
                </Label>
                <Input
                  id="beds"
                  name="beds"
                  type="number"
                  value={formData.beds}
                  onChange={handleChange}
                  required
                  className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="baths" className="text-white">
                  Baths
                </Label>
                <Input
                  id="baths"
                  name="baths"
                  type="number"
                  value={formData.baths}
                  onChange={handleChange}
                  required
                  className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="squareFeet" className="text-white">
                Square Feet
              </Label>
              <Input
                id="squareFeet"
                name="squareFeet"
                type="number"
                value={formData.squareFeet}
                onChange={handleChange}
                required
                className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPetsAllowed"
                  checked={formData.isPetsAllowed}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("isPetsAllowed", checked === true)
                  }
                  className="border-[#2D3748] data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="isPetsAllowed" className="text-white">
                  Pets Allowed
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isParkingIncluded"
                  checked={formData.isParkingIncluded}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("isParkingIncluded", checked === true)
                  }
                  className="border-[#2D3748] data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="isParkingIncluded" className="text-white">
                  Parking Included
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B]/50 border border-[#2D3748] rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Location</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-white">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-white">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-white">
                  State
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="postalCode" className="text-white">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country" className="text-white">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B]/50 border border-[#2D3748] rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Photos</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="photos" className="text-white">
                Add New Photos
              </Label>
              <Input
                id="photos"
                name="photos"
                type="file"
                multiple
                onChange={handleFileChange}
                className="bg-[#0F1117] border-[#2D3748] text-white mt-1"
              />
              <p className="text-sm text-gray-400 mt-1">
                You can select multiple files. New photos will be added to
                existing ones.
              </p>
            </div>

            {property?.photoUrls && property.photoUrls.length > 0 && (
              <div>
                <Label className="text-white mb-2 block">Current Photos</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {property.photoUrls.map((url: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden border border-[#2D3748]"
                    >
                    

<div className="relative w-full h-full">
  <Image
    src={url || "/placeholder.svg"}
    alt={`Property photo ${index + 1}`}
    fill
    className="object-cover"
    unoptimized={url.startsWith("blob:") || url.startsWith("data:")}
  />
</div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => router.push("/dashboard/properties")}
            variant="outline"
            className="border-[#2D3748] text-white hover:bg-[#2D3748] hover:text-white"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}