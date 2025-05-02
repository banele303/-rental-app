"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import PropertyCardDashboard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';

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

  const handleEditProperty = (id: number) => {
    router.push(`/managers/properties/edit/${id}`);
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
    <div className="max-auto md:pl-[18rem] px-4 py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <Header
            title="My Properties"
            subtitle="View and manage your property listings"
          />
          <Button 
            onClick={() => router.push("/managers/properties/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
        
        {(!managerProperties || managerProperties.length === 0) && (
          <p className="py-4 text-base text-red-600 font-medium">
            You don&lsquo;t manage any properties
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {managerProperties?.map((property) => (
            <PropertyCardDashboard
              key={property.id}
              property={property}
              propertyLink={`/managers/properties/${property.id}`}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
              onDuplicate={handleDuplicateProperty}
            />
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="text-red-500 mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-black text-white border-[#333]">
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
              className="bg-red-900/30 hover:bg-red-900/50 border-red-900/50"
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

export default Properties;