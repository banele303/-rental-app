"use client";

import type React from "react";

import {
  Bath,
  Bed,
  Copy,
  Edit,
  Heart,
  Home,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PropertyCardProps {
  property: {
    id: number;
    name: string;
    location: {
      address: string;
      city: string;
    };
    photoUrls?: string[];
    beds: number;
    baths: number;
    squareFeet: number;
    pricePerMonth: number;
    averageRating?: number;
    numberOfReviews?: number;
    isPetsAllowed?: boolean;
    isParkingIncluded?: boolean;
  };
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  showFavoriteButton?: boolean;
  propertyLink?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDuplicate?: (id: number) => void;
  showActions?: boolean;
}

export default function PropertyCardDashboard({
  property,
  isFavorite = false,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
  onDelete,
}: PropertyCardProps) {
  const [imgSrc, setImgSrc] = useState(property.photoUrls?.[0]);

  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(property.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/managers/properties/${property.id}/edit`);
    // Optionally, call onEdit if needed:
    // if (onEdit) {
    //   onEdit(property.id);
    // }
  };

  // const handleDuplicate = (e: React.MouseEvent) => {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   if (onDuplicate) {
  //     onDuplicate(property.id)
  //   }
  // }

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

      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={imgSrc ?? "/placeholder.jpg"}
          alt={property.name}
          fill
          className={`object-cover transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(err) => setImgSrc("/placeholder.jpg")}
          priority
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1112] via-transparent to-[#0F1112]/40 z-10" />

        {/* Price tag */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-[#0F1112]/80 backdrop-blur-md text-white px-3 py-1.5 rounded-md flex items-center shadow-lg border border-[#333]">
            <span className="font-bold">
              R{property.pricePerMonth.toFixed(0)}
            </span>
            <span className="text-xs text-white/80 ml-1">/mo</span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-20">
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

      <div className="p-5 space-y-4 bg-transparent relative z-10">
        <div>
          <div className="flex items-start justify-between mb-1">
            <h2 className="line-clamp-1 text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {propertyLink ? (
                <Link
                  href={propertyLink}
                  className="hover:text-blue-400"
                  scroll={false}
                >
                  {property.name}
                </Link>
              ) : (
                property.name
              )}
            </h2>
            {property.averageRating && (
              <div className="flex items-center gap-1 bg-[#111] px-2 py-0.5 rounded-md border border-[#333]">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-white">
                  {property.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-400 mb-3">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <p className="line-clamp-1">
              {property.location.address}, {property.location.city}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-[#111]/80 backdrop-blur-sm border border-[#333]">
            <Bed className="h-4 w-4 mb-1 text-blue-400" />
            <span className="font-medium text-white">{property.beds}</span>
            <span className="text-xs text-gray-400">Beds</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-[#111]/80 backdrop-blur-sm border border-[#333]">
            <Bath className="h-4 w-4 mb-1 text-blue-400" />
            <span className="font-medium text-white">{property.baths}</span>
            <span className="text-xs text-gray-400">Baths</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-[#111]/80 backdrop-blur-sm border border-[#333]">
            <Home className="h-4 w-4 mb-1 text-blue-400" />
            <span className="font-medium text-white">
              {property.squareFeet}
            </span>
            <span className="text-xs text-gray-400">sq ft</span>
          </div>
        </div>

        {/* Action buttons - always visible */}

        <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#333]/80 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-[#111]/80 backdrop-blur-sm border-[#333] hover:bg-[#222] text-white"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          {/* <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-[#111] border-[#333] hover:bg-[#222] text-white"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button> */}

          <Button
            variant="destructive"
            size="sm"
            className="flex-1 bg-red-900/30 hover:bg-red-900/50 border-red-700/50 backdrop-blur-sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Favorite button */}
        {showFavoriteButton && (
          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-4 right-4 h-9 w-9 rounded-full p-0 z-20 transition-all duration-300 ${
              isFavorite
                ? "bg-white/90 text-red-500 shadow-lg"
                : "bg-black/70 text-white backdrop-blur-sm border border-[#333] shadow-lg"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle?.();
            }}
          >
            <Heart
              className={`h-5 w-5 transition-all duration-300 ${
                isFavorite ? "fill-red-500 scale-110" : ""
              }`}
            />
            <span className="sr-only">Toggle favorite</span>
          </Button>
        )}
      </div>
    </Card>
  );
}