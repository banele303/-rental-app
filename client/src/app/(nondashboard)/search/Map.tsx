"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef(null);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  useEffect(() => {
    if (isLoading || isError || !properties) return;

    // Default coordinates for South Africa (Johannesburg)
    const defaultCoordinates: [number, number] = [28.0473, -26.2041];
    
    // Validate coordinates to ensure they're valid numbers within range
    let validCoordinates: [number, number];
    if (
      filters.coordinates && 
      Array.isArray(filters.coordinates) && 
      filters.coordinates.length === 2 &&
      typeof filters.coordinates[0] === 'number' && 
      typeof filters.coordinates[1] === 'number' &&
      filters.coordinates[0] >= -180 && 
      filters.coordinates[0] <= 180 &&
      filters.coordinates[1] >= -90 && 
      filters.coordinates[1] <= 90
    ) {
      validCoordinates = filters.coordinates;
    } else {
      validCoordinates = defaultCoordinates;
    }

    let mapInstance: mapboxgl.Map | null = null;
    
    try {
      mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/alexbsibanda/cm9r6ojpt008m01s046hwhlbp",
        center: validCoordinates,
        zoom: 9,
      });

      // Only add markers if properties have valid coordinates
      properties.forEach((property) => {
        try {
          const marker = createPropertyMarker(property, mapInstance!);
          // Only modify marker if it was successfully created
          if (marker) {
            const markerElement = marker.getElement();
            const path = markerElement.querySelector("path[fill='#3FB1CE']");
            if (path) path.setAttribute("fill", "#000000");
          }
        } catch (err) {
          console.error("Error creating marker:", err);
        }
      });

      const resizeMap = () => {
        if (mapInstance) setTimeout(() => mapInstance.resize(), 700);
      };
      resizeMap();
      
    } catch (err) {
      console.error("Error creating map:", err);
    }
    
    // Return cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [isLoading, isError, properties, filters.coordinates]);

  if (isLoading) return <>Loading... here</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="hidden pt-5 md:block md:basis-7/12 grow relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};

const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
  // Validate property coordinates before creating marker
  if (!property.location?.coordinates?.longitude || !property.location?.coordinates?.latitude) {
    console.error(`Property ${property.id} has invalid coordinates`);
    return null;
  }
  
  // Check if coordinates are within valid ranges
  const lng = property.location.coordinates.longitude;
  const lat = property.location.coordinates.latitude;
  
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    console.error(`Property ${property.id} has out of range coordinates: [${lng}, ${lat}]`);
    return null;
  }
  
  try {
    const marker = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `
          <div class="marker-popup">
            <div class="marker-popup-image"></div>
            <div>
              <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
              <p class="marker-popup-price">
                R${property.pricePerMonth}
                <span class="marker-popup-price-unit"> / month</span>
              </p>
            </div>
          </div>
          `
        )
      )
      .addTo(map);
    return marker;
  } catch (err) {
    console.error(`Error creating marker for property ${property.id}:`, err);
    return null;
  }
};

export default Map;