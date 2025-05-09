"use client";

import ModernPropertyCard from "@/components/ModernPropertyCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { Heart } from "lucide-react";
import React, { useState } from "react";

const Favorites = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const { data: tenant, refetch: refetchTenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      // Skip if no user ID or if user is a manager
      skip: !authUser?.cognitoInfo?.userId || authUser?.userRole === "manager",
    }
  );

  const {
    data: favoriteProperties,
    isLoading,
    error,
    refetch: refetchProperties,
  } = useGetPropertiesQuery(
    { favoriteIds: tenant?.favorites?.map((fav: { id: number }) => fav.id) },
    { skip: !tenant?.favorites || tenant?.favorites.length === 0 }
  );

  const handleRemoveFavorite = async (propertyId: number) => {
    try {
      // Pass both cognitoId and propertyId as an object to match the expected type
      await removeFavorite({ 
        cognitoId: authUser?.cognitoInfo?.userId || "", 
        propertyId 
      }).unwrap();
      // Refetch to update the UI
      refetchTenant();
      refetchProperties();
    } catch (err) {
      console.error("Failed to remove from favorites:", err);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading favorites</div>;

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header
        title="Favorited Properties"
        subtitle="Browse and manage your saved property listings"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {favoriteProperties?.map((property) => (
          <ModernPropertyCard
            key={property.id}
            property={property}
            isFavorite={true}
            onFavoriteToggle={() => handleRemoveFavorite(property.id)}
            showFavoriteButton={true}
            propertyLink={`/properties/${property.id}`}
            userRole="tenant"
          />
        ))}
      </div>
      
      {(!favoriteProperties || favoriteProperties.length === 0) && (
        <div className="flex flex-col items-center justify-center p-12 mt-8 bg-[#0F1112] border border-[#333] rounded-xl text-center">
          <Heart className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Favorites Yet</h3>
          <p className="text-gray-400">You haven&apos;t added any properties to your favorites yet. Browse properties and click the heart icon to add them here.</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
