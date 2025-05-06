"use client"

import { Bath, Bed, Heart, Home, MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PropertyCardCompactProps {
  property: {
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
  }
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  showFavoriteButton?: boolean
  propertyLink?: string
}

export default function DashboardCardCompact({
  property,
  isFavorite = false,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: PropertyCardCompactProps) {
  const [imgSrc, setImgSrc] = useState(property.photoUrls?.[0] || "/placeholder.svg?height=300&width=300")
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card 
      className="flex flex-row h-auto min-h-[160px] overflow-hidden transition-all duration-300 hover:shadow-xl border border-[#333] bg-black rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full w-1/3 min-w-[120px] overflow-hidden">
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={property.name}
          fill
          className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
          sizes="(max-width: 768px)"
          onError={() => setImgSrc("/placeholder.svg?height=300&width=300")}
          priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />
        
        {/* Badges */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1.5 z-20">
          {property.isPetsAllowed && (
            <Badge className="bg-black/80 text-white text-xs font-medium backdrop-blur-sm border border-[#333]">
              Pets
            </Badge>
          )}
          {property.isParkingIncluded && (
            <Badge className="bg-black/80 text-white text-xs font-medium backdrop-blur-sm border border-[#333]">
              Parking
            </Badge>
          )}
        </div>
      </div>
      
      <div className="relative flex w-2/3 flex-col justify-between p-3 sm:p-4 bg-black text-white">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 text-base font-bold sm:text-lg group-hover:text-blue-400 transition-colors">
              {propertyLink ? (
                <Link href={propertyLink} className="hover:text-blue-400" scroll={false}>
                  {property.name}
                </Link>
              ) : (
                property.name
              )}
            </h2>
            {showFavoriteButton && (
              <Button
                size="icon"
                variant="ghost"
                className={`h-6 w-6 shrink-0 rounded-full p-0 transition-colors ${
                  isFavorite ? "text-red-500" : "text-gray-400 hover:text-white"
                }`}
                onClick={onFavoriteToggle}
              >
                <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? "fill-red-500 scale-110" : ""}`} />
                <span className="sr-only">Toggle favorite</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center text-xs text-gray-400">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <p className="line-clamp-1">
              {property.location.address}, {property.location.city}
            </p>
          </div>
          
          <div className="flex items-center gap-1 bg-[#111] px-2 py-0.5 rounded-md border border-[#333] w-fit">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{property.averageRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({property.numberOfReviews})</span>
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-2 text-xs text-gray-400 sm:text-sm">
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span>{property.baths}</span>
            </div>
            <div className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>{property.squareFeet}</span>
            </div>
          </div>
          
          <div className="bg-black/80 backdrop-blur-md text-white px-2 py-1 rounded-md flex items-center shadow-md border border-[#333]">
            <span className="font-bold text-sm sm:text-base">
              R{property.pricePerMonth.toFixed(0)}
            </span>
            <span className="text-xs text-white/80 ml-1">/mo</span>
          </div>
        </div>
      </div>
    </Card>
  )
}