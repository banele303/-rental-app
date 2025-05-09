"use client";

import ModernPropertyCard from "@/components/ModernPropertyCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetCurrentResidencesQuery,
  useGetTenantQuery,
} from "@/state/api";
import { Building, Home } from "lucide-react";
import React from "react";

const Residences = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      // Skip if no user ID or if user is a manager
      skip: !authUser?.cognitoInfo?.userId || authUser?.userRole === "manager",
    }
  );

  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading current residences</div>;

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header
        title="Current Residences"
        subtitle="View and manage your current living spaces"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {currentResidences?.map((property) => (
          <ModernPropertyCard
            key={property.id}
            property={property}
            isFavorite={tenant?.favorites.includes(property.id) || false}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/tenants/residences/${property.id}`}
            userRole="tenant"
          />
        ))}
      </div>
      
      {(!currentResidences || currentResidences.length === 0) && (
        <div className="flex flex-col items-center justify-center p-12 mt-8 bg-[#0F1112] border border-[#333] rounded-xl text-center">
          <Building className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Current Residences</h3>
          <p className="text-gray-400">You don&apos;t have any active leases or rental agreements at this time.</p>
        </div>
      )}
    </div>
  );
};

export default Residences;