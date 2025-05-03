
"use client"
import { useState } from 'react';
import { useGetAuthUserQuery, useGetPropertiesQuery, useGetTenantQuery, useAddFavoritePropertyMutation, useRemoveFavoritePropertyMutation } from "@/state/api";
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types/prismaTypes";
import { Heart, MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';

const HomeListings = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    { skip: !authUser?.cognitoInfo?.userId }
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
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-blue-200 mb-4"></div>
        <div className="text-sm font-medium text-gray-600">Finding your perfect home...</div>
      </div>
    </div>
  );

  if (isError || !properties) return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className="flex flex-col items-center text-center p-4">
        <div className="text-red-500 text-lg mb-2">Oops! Something went wrong</div>
        <p className="text-sm text-gray-600">We couldn&apos;t fetch the properties. Please try again.</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 shadow-sm">
        <h3 className="text-sm font-medium flex flex-wrap items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">{properties.length}</span>
          <span className="text-gray-700">
            Properties available in <span className="font-semibold">{filters.location}</span>
          </span>
        </h3>
      </div>

      <div className="px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={tenant?.favorites?.some((fav: Property) => fav.id === property.id) || false}
              onFavoriteToggle={() => handleFavoriteToggle(property.id)}
              showFavoriteButton={!!authUser}
              propertyLink={`/search/${property.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  showFavoriteButton: boolean;
  propertyLink: string;
}

const PropertyCard = ({ property, isFavorite, onFavoriteToggle, showFavoriteButton, propertyLink }: PropertyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Format price with commas
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative h-56 overflow-hidden">
        <a href={propertyLink} className="block h-full">
          <img 
            src={property.images?.[0] || "/api/placeholder/400/320"} 
            alt={property.title} 
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        </a>
        
        {/* Badge for property type */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          {property.type}
        </div>
        
        {/* Favorite button */}
        {showFavoriteButton && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle();
            }}
            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
          >
            <Heart
              size={20}
              className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Rating */}
        {property.rating && (
          <div className="flex items-center mb-2">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium">{property.rating}</span>
            {property.reviewCount && (
              <span className="text-sm text-gray-500 ml-1">({property.reviewCount} reviews)</span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-lg mb-1 text-gray-800 line-clamp-1">
          <a href={propertyLink} className="hover:text-blue-600 transition-colors">
            {property.title}
          </a>
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-500 mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm line-clamp-1">{property.location}</span>
        </div>

        {/* Features */}
        <div className="flex gap-4 mb-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed size={16} className="text-gray-500 mr-1" />
              <span className="text-sm">{property.bedrooms} beds</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath size={16} className="text-gray-500 mr-1" />
              <span className="text-sm">{property.bathrooms} baths</span>
            </div>
          )}
          {property.squareFootage && (
            <div className="flex items-center">
              <Maximize size={16} className="text-gray-500 mr-1" />
              <span className="text-sm">{property.squareFootage} sq ft</span>
            </div>
          )}
        </div>

        {/* Price section */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-blue-600">{formattedPrice}</span>
              {property.priceUnit && (
                <span className="text-gray-500 text-sm ml-1">/{property.priceUnit}</span>
              )}
            </div>
            <a 
              href={propertyLink}
              className="text-blue-600 font-medium text-sm hover:underline"
            >
              View details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeListings;