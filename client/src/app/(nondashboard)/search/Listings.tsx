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
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const { data: tenant, isError: tenantError } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      // Skip if no user ID or if user is a manager
      skip: !authUser?.cognitoInfo?.userId || authUser?.userRole === "manager",
      // Don't refetch on focus to prevent unnecessary error toasts
      refetchOnFocus: false,
      // Don't refetch on reconnect to prevent unnecessary error toasts
      refetchOnReconnect: false,
    }
  );
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);

  const {
    data: allProperties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters, {
    // Make sure we can still fetch properties even if auth fails
    skip: false
  });
  
  // Filter properties to ensure they actually match the searched location
  const properties = React.useMemo(() => {
    if (!allProperties || !filters.location) return allProperties;
    
    // If no specific location is searched, show all properties
    if (filters.location === 'any') return allProperties;
    
    // Normalize the searched location (remove 'South Africa' and lowercase)
    const searchedLocation = filters.location
      .replace(/,\s*south africa/i, '')
      .toLowerCase()
      .trim();
    
    // Filter properties based on location match with more strict criteria
    return allProperties.filter(property => {
      // Get property city/address and normalize
      const propertyCity = (property.location?.city || '').toLowerCase().trim();
      const propertyAddress = (property.location?.address || '').toLowerCase().trim();
      const propertyProvince = (property.location?.province || '').toLowerCase().trim();
      
      // For exact city matching
      if (propertyCity === searchedLocation) {
        return true;
      }
      
      // For neighborhood/suburb/township within a city
      // Only match if the city explicitly contains the neighborhood or vice versa
      if (propertyCity.includes(' ' + searchedLocation) || 
          propertyCity.includes(searchedLocation + ' ') ||
          searchedLocation.includes(' ' + propertyCity) ||
          searchedLocation.includes(propertyCity + ' ')) {
        return true;
      }
      
      // Match addresses but require the match to be a complete word or phrase
      const addressWords = propertyAddress.split(/\s+|,/);
      const searchWords = searchedLocation.split(/\s+|,/);
      
      // Check if the address contains all search words in sequence
      const addressMatch = searchWords.every(word => 
        word.length > 2 && propertyAddress.includes(word)
      );
      
      // Exclude properties that don't match the correct city/province
      // This prevents showing Johannesburg properties when searching for Pretoria
      const incorrectCityMatch = 
        (searchedLocation.includes('pretoria') && propertyCity.includes('johannesburg')) ||
        (searchedLocation.includes('johannesburg') && propertyCity.includes('pretoria'));
      
      if (incorrectCityMatch) {
        return false;
      }
      
      return addressMatch;
    });
  }, [allProperties, filters.location]);

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
    <div className="w-full max-w-screen-xl pt-6 mx-auto">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm">
        <h3 className="text-sm font-semibold flex flex-wrap items-center gap-1">
          {properties && properties.length > 0 ? (
            <>
              <span className="text-lg">{properties.length}</span>
              <span className="text-gray-700 font-normal">
                {properties.length === 1 ? 'Property' : 'Properties'} in {filters.location || 'South Africa'}
              </span>
            </>
          ) : (
            <span className="text-gray-700">
              Search results for {filters.location || 'South Africa'}
            </span>
          )}
        </h3>
      </div>
      
      <div className="px-2 sm:px-4 pb-6">
        {properties && properties.length > 0 ? (
          <div className="grid gap-4 sm:gap-6">
            {properties.map((property) => {
            // Check if property is in favorites, only if user is logged in
            const isFavorite = authUser && tenant?.favorites ? 
              tenant.favorites.some((fav: Property) => fav.id === property.id) : false;
              
            return viewMode === "list" ? (
              <Card
                key={property.id}
                property={property}
                isFavorite={isFavorite}
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
                userRole={authUser?.userRole || null}
              />
            ) : (
              <CardCompact
                key={property.id}
                property={property}
                isFavorite={isFavorite}
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
                userRole={authUser?.userRole || null}
              />
            );
          })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-gray-200 bg-gray-50 rounded-lg mt-4">
            <div className="text-blue-500 bg-blue-50 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found in {filters.location}</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              We couldn&apos;t find any properties in this location. Try searching for a different area or check out our other listings.  
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => {
                  // Reset location filter but keep other filters
                  const { location, ...otherFilters } = filters;
                  window.location.href = `/search?${new URLSearchParams(Object.entries(otherFilters).map(([k, v]) => 
                    [k, Array.isArray(v) ? v.join(',') : String(v)]
                  ))}`;
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View All Properties
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;