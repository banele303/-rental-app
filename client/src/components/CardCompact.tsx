"use client"

import { Bath, Bed, Heart, Home, Star } from "lucide-react"
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

export default function PropertyCardCompact({
  property,
  isFavorite = false,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: PropertyCardCompactProps) {
  const [imgSrc, setImgSrc] = useState(property.photoUrls?.[0] || "/placeholder.svg?height=300&width=300")

  return (
    <Card className="flex flex-row h-auto min-h-[160px] overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative h-full w-1/3 min-w-[120px] overflow-hidden">
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105 rounded-xl"
          sizes="(max-width: 768px)"
          onError={() => setImgSrc("/placeholder.svg?height=300&width=300")}
          priority
        />
        <div className="absolute bottom-2 left-2 flex flex-col gap-1.5">
          {property.isPetsAllowed && (
            <Badge variant="secondary" className="bg-white/90 text-xs font-medium">
              Pets
            </Badge>
          )}
          {property.isParkingIncluded && (
            <Badge variant="secondary" className="bg-white/90 text-xs font-medium">
              Parking
            </Badge>
          )}
        </div>
      </div>
      <div className="relative flex w-2/3 flex-col justify-between p-3 sm:p-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 text-base font-bold sm:text-lg">
              {propertyLink ? (
                <Link href={propertyLink} className="hover:text-primary" scroll={false}>
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
                className="h-6 w-6 shrink-0 rounded-full p-0"
                onClick={onFavoriteToggle}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                <span className="sr-only">Toggle favorite</span>
              </Button>
            )}
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
            {property.location.address}, {property.location.city}
          </p>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium sm:text-sm">{property.averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({property.numberOfReviews})</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-2 text-xs text-muted-foreground sm:text-sm">
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
          <p className="whitespace-nowrap text-sm font-bold text-primary sm:text-base">
            R{property.pricePerMonth.toFixed(0)}
            <span className="text-xs font-normal text-muted-foreground"> /mo</span>
          </p>
        </div>
      </div>
    </Card>
  )
}
