import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types/prismaTypes";
import Card from "@/components/Card";
import CardCompact from "@/components/CardCompact";
import React from "react";

const Listings = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);

  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser) return;

    const isFavorite = tenant?.favorites?.some(
      (fav: Property) => fav.id === propertyId
    );

    if (isFavorite) {
      await removeFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
    } else {
      await addFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[300px]  w-full">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-indigo-200 mb-4"></div>
        <div className="text-sm font-medium text-gray-600">Loading properties...</div>
      </div>
    </div>
  );
    
  if (isError || !properties) return (
    <div className="flex justify-center items-center min-h-[300px] w-full">
      <div className="flex flex-col items-center text-center p-4">
        <div className="text-red-500 text-lg mb-2">Something went wrong</div>
        <p className="text-sm text-gray-600">Failed to fetch properties</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-screen-xl  mx-auto">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm">
        <h3 className="text-sm font-semibold flex flex-wrap items-center gap-1">
          <span className="text-lg">{properties.length}</span>
          <span className="text-gray-700 font-normal">
            Places in {filters.location}
          </span>
        </h3>
      </div>
      
      <div className="px-2 sm:px-4 pb-6">
        <div className="grid gap-4 sm:gap-6">
          {properties?.map((property) =>
            viewMode === "grid" ? (
              <Card
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
              />
            ) : (
              <CardCompact
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;