"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  Search,
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  Edit3,
  Trash2,
  ArrowUpDown,
  Home
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Properties = () => {
  const router = useRouter();
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: managerProperties,
    isLoading,
    error,
    refetch,
  } = useGetManagerPropertiesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  const [deletePropertyId, setDeletePropertyId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "date">("name");

  // Filter properties based on search term
  const filteredProperties = managerProperties?.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort properties based on sort selection
  const sortedProperties = [...(filteredProperties || [])].sort((a, b) => {
    if (sortBy === "price") return a.pricePerMonth - b.pricePerMonth;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    // Default sort by name
    return a.name.localeCompare(b.name);
  });

  const handleEditProperty = (id: number) => {
    router.push(`/managers/properties/${id}/edit`);
  };

  const handleDeleteProperty = (id: number) => {
    setDeletePropertyId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateProperty = (id: number) => {
    // Find the property to duplicate
    const propertyToDuplicate = managerProperties?.find((prop) => prop.id === id);

    if (propertyToDuplicate) {
      // Store the property data in session storage
      sessionStorage.setItem("duplicatePropertyData", JSON.stringify(propertyToDuplicate));
      // Navigate to create page
      router.push("/managers/properties/create");
    }
  };

  const confirmDelete = async () => {
    if (!deletePropertyId || !authUser?.cognitoInfo?.userId) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      // Import and use AWS Amplify's fetchAuthSession to get the idToken
      const { fetchAuthSession } = await import("aws-amplify/auth");
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};

      if (!idToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${deletePropertyId}?managerCognitoId=${authUser.cognitoInfo.userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Failed to delete property (Status: ${response.status})`;
        throw new Error(errorMsg);
      }

      // Refetch properties after successful deletion
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting property:", error);

      // Handle token expired or invalid cases
      if (error.message?.includes("token") || error.message?.includes("unauthorized") || error.message?.includes("Unauthorized")) {
        setErrorMessage("Your session has expired. Please log in again.");
        // Optional: redirect to login
        // router.push("/login");
      } else {
        setErrorMessage(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading manager properties</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header with gradient background */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-blue-950 to-black rounded-xl p-6 md:p-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 z-0"></div>

          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Properties</h1>
              <p className="text-gray-300">View and manage your property listings</p>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search properties..."
                    className="pl-10 bg-white/10 border-white/20 text-white w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white w-full sm:w-40">
                      <div className="flex items-center">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Sort by" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <Button
                onClick={() => router.push("/managers/newproperty")}
                className="bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </div>

        {(!managerProperties || managerProperties.length === 0) && (
          <div className="bg-[#111] border border-[#333] rounded-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Properties Found</h3>
            <p className="text-gray-400 mb-6">You don&apos;t manage any properties yet. Add your first property to get started.</p>
            <Button
              onClick={() => router.push("/managers/newproperty")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Property
            </Button>
          </div>
        )}

        {/* Property grid with modern cards */}
        {managerProperties && managerProperties.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 mt-4 p-4 rounded-xl">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#0F1112] text-white border-[#333] rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#333] text-white hover:bg-[#222] hover:text-white"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-900/30 hover:bg-red-900/50 border-red-700/50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Custom Property Card component that matches the style of the property detail page
const PropertyCard = ({ property, onEdit, onDelete }: {
  property: any,
  onEdit: (id: number) => void,
  onDelete: (id: number) => void
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl border border-[#333] bg-gradient-to-br from-blue-950/80 to-black rounded-xl relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background grid pattern and decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 z-0"></div>
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>

      {/* Horizontal layout with image on left, content on right */}
      <div className="relative z-10 flex flex-col md:flex-row gap-4 p-4">
        {/* Image container with fixed aspect ratio */}
        <div className="relative w-full md:w-2/5 aspect-[4/3] rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 flex-shrink-0">
          <Link href={`/managers/properties/${property.id}`} scroll={false}>
            <Image
              src={property.photoUrls?.[0] ?? "/placeholder.jpg"}
              alt={property.name}
              fill
              className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"
                }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.jpg";
              }}
              priority
            />
          </Link>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Price tag */}
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-[#0F1112]/80 backdrop-blur-md text-white px-3 py-1.5 rounded-md flex items-center shadow-lg border border-[#333]">
              <span className="font-bold">
                R{property.pricePerMonth.toFixed(0)}
              </span>
              <span className="text-xs text-white/80 ml-1">/mo</span>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 z-20">
            {property.isPetsAllowed && (
              <Badge className="bg-black/70 text-white text-xs font-medium backdrop-blur-sm border border-[#333]">
                Pets Allowed
              </Badge>
            )}
            {property.isParkingIncluded && (
              <Badge className="bg-black/70 text-white text-xs font-medium backdrop-blur-sm border border-[#333]">
                Parking
              </Badge>
            )}
          </div>
        </div>

        {/* Property details - right side */}
        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <Link href={`/managers/properties/${property.id}`} scroll={false} className="block">
              <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                {property.name}
              </h2>
            </Link>

            <div className="flex items-center text-sm text-white/80 mb-4">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="line-clamp-1">
                {property.location.address}, {property.location.city}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white/5 backdrop-blur-sm border border-white/10">
                <BedDouble className="h-4 w-4 mb-1 text-blue-400" />
                <span className="font-medium text-white">{property.beds}</span>
                <span className="text-xs text-gray-400">Beds</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white/5 backdrop-blur-sm border border-white/10">
                <Bath className="h-4 w-4 mb-1 text-blue-400" />
                <span className="font-medium text-white">{property.baths}</span>
                <span className="text-xs text-gray-400">Baths</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white/5 backdrop-blur-sm border border-white/10">
                <Ruler className="h-4 w-4 mb-1 text-blue-400" />
                <span className="font-medium text-white">
                  {property.squareFeet}
                </span>
                <span className="text-xs text-gray-400">sq ft</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 text-white"
              onClick={() => onEdit(property.id)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="flex-1 bg-red-900/30 hover:bg-red-900/50 border-red-700/50 backdrop-blur-sm"
              onClick={() => onDelete(property.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Properties;