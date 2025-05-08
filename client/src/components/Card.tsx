"use client"

import type React from "react"
import type { ImageLoaderProps } from "next/image"
import { Bath, Bed, Edit, Heart, Home, MapPin, Star, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PropertyCardProps {
  property: {
    id: number
    name: string
    location: {
      address: string
      city: string
    }
    photoUrls?: string[]
    beds: number
    baths: number
    squareFeet: number
    pricePerMonth: number
    averageRating: number
    numberOfReviews: number
    isPetsAllowed?: boolean
    isParkingIncluded?: boolean
    availableRooms?: number
  }
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  showFavoriteButton?: boolean
  propertyLink?: string
  showActions?: boolean
  userRole?: "tenant" | "manager" | null
}

function PropertyCard({
  property,
  isFavorite = false,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
  showActions = false,
  userRole = null,
}: PropertyCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(property.photoUrls?.[0] || "/placeholder.jpg")
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Custom loader that just returns the URL as-is
  const loaderFunc = ({ src }: ImageLoaderProps) => {
    return src
  }

  // Handle image error
  const handleImageError = () => {
    console.error(`Failed to load image: ${imgSrc}`)
    setImgError(true)
    setImgSrc("/placeholder.jpg")
  }

  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <Card
      className="group overflow-hidden transition-all bg-white mt-6 duration-300 hover:shadow-md border border-gray-200 bg-white rounded-xl relative max-w-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[4/3] px-2 overflow-hidden">
        <div className="relative w-full h-full">
          {!imgError ? (
            <Image
              src={imgSrc}
              alt={property.name}
              fill
              loader={loaderFunc}
              unoptimized={true}
              className={`object-cover   transition-transform rounded-xl duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
              onError={handleImageError}
              
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Subtle overlay gradient */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 z-10" /> */}

        {/* Price tag */}
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-white shadow-md text-gray-800 px-3 py-1.5 rounded-md flex items-center border border-gray-100">
            <span className="font-bold">R{property.pricePerMonth.toFixed(0)}</span>
            <span className="text-xs text-gray-500 ml-1">/mo</span>
          </div>
        </div>
        
        {/* Available rooms badge */}
        {property.availableRooms !== undefined && property.availableRooms > 0 && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-green-500 text-white text-xs font-medium">
              {property.availableRooms} {property.availableRooms === 1 ? 'Room' : 'Rooms'} Available
            </Badge>
          </div>
        )}

        {/* Feature badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 z-20">
          {property.isPetsAllowed && (
            <Badge className="bg-white/90 text-gray-800 text-xs font-medium backdrop-blur-sm border border-gray-200">
              Pets Allowed
            </Badge>
          )}
          {property.isParkingIncluded && (
            <Badge className="bg-white/90 text-gray-800 text-xs font-medium backdrop-blur-sm border border-gray-200">
              Parking Included
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 bg-white">
        <div>
          <div className="flex items-start justify-between mb-1">
            <h2 className="line-clamp-1 text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {propertyLink ? (
                <Link href={propertyLink} className="hover:text-blue-600" scroll={false}>
                  {property.name}
                </Link>
              ) : (
                property.name
              )}
            </h2>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-800">{property.averageRating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <p className="line-clamp-1">
              {property.location.address}, {property.location.city}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-50 border border-gray-100">
            <Bed className="h-4 w-4 mb-1 text-gray-500" />
            <span className="font-medium text-gray-800">{property.beds}</span>
            <span className="text-xs text-gray-500">Beds</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-50 border border-gray-100">
            <Bath className="h-4 w-4 mb-1 text-gray-500" />
            <span className="font-medium text-gray-800">{property.baths}</span>
            <span className="text-xs text-gray-500">Baths</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-50 border border-gray-100">
            <Home className="h-4 w-4 mb-1 text-gray-500" />
            <span className="font-medium text-gray-800">{property.squareFeet}</span>
            <span className="text-xs text-gray-500">m²</span>
          </div>
        </div>

        {/* Favorite button - only show for tenants */}
        {showFavoriteButton && userRole === "tenant" && (
          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-3 right-3 h-8 w-8 rounded-full p-0 z-20 transition-all duration-300 ${
              isFavorite ? "bg-white text-red-500 shadow-sm" : "bg-white/90 text-gray-600 backdrop-blur-sm border border-gray-200 shadow-sm"
            }`}
            onClick={(e) => {
              e.preventDefault()
              onFavoriteToggle?.()
            }}
            title="Add to favorites"
          >
            <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? "fill-red-500 scale-110" : ""}`} />
            <span className="sr-only">Toggle favorite</span>
          </Button>
        )}
        
        {/* Show disabled favorite button with tooltip for managers */}
        {showFavoriteButton && userRole === "manager" && (
          <div className="absolute top-3 right-3 z-20 group">
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 bg-white/90 text-gray-400 border border-gray-200 shadow-sm opacity-60 cursor-not-allowed"
                disabled
                title="Managers cannot favorite properties"
              >
                <Heart className="h-4 w-4" />
                <span className="sr-only">Favorite not available</span>
              </Button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                Only tenants can add properties to favorites
                <div className="absolute bottom-0 right-3 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default PropertyCard;
