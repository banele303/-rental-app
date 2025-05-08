"use client";
import Image from "next/image";
import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/state";
import { Search, MapPin, Home, Building, Warehouse } from "lucide-react";

const HeroSection = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("rent");
  const [scrolled, setScrolled] = useState<boolean>(false);

  // South African university coordinates
  const universityLocations = {
    UCT: {
      name: "University of Cape Town",
      coordinates: [-33.9577, 18.4612], // Verified
    },
    WITS: {
      name: "University of the Witwatersrand",
      coordinates: [-26.1908, 28.0303], // Slightly adjusted
    },
    UJ: {
      name: "University of Johannesburg",
      coordinates: [-26.1825, 28.0002], // Verified coordinates
    },
    UKZN: {
      name: "University of KwaZulu-Natal",
      coordinates: [-29.8667, 30.9724], // Slightly adjusted
    },
    UWC: {
      name: "University of the Western Cape",
      coordinates: [-33.9308, 18.6272], // Slightly adjusted
    },
    UP: {
      name: "University of Pretoria",
      coordinates: [-25.7545, 28.2314], // Verified
    },
    SU: {
      name: "Stellenbosch University",
      coordinates: [-33.9330, 18.8669], // Slightly adjusted
    }
  };


  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;
      
      // Search for locations without country restriction
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmedQuery
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true&types=place,locality,neighborhood,address,poi`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Use the first result directly
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        
        // Extract just the place name without country
        const locationName = feature.place_name.split(',')[0];
        
        // Update the filters in the redux store
        dispatch(
          setFilters({
            location: locationName,
            coordinates: [lng, lat] as [number, number],
          })
        );
        
        // Navigate to the search page with the query parameters
        const params = new URLSearchParams({
          location: locationName,
          coordinates: `${lng},${lat}`,
          lat: lat.toString(),
          lng: lng.toString(),
        });
        
        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  // Handle university button click
  const handleUniversityClick = (universityKey: string) => {
    setActiveTab(universityKey.toLowerCase());

    const university = universityLocations[universityKey as keyof typeof universityLocations];
    if (university) {
      // Get the coordinates in the correct format
      const [lat, lng] = university.coordinates;

      // Update the search query to the university name
      setSearchQuery(university.name);

      // Update the filters in the redux store with the correct coordinate format
      dispatch(
        setFilters({
          location: university.name,
          coordinates: [lng, lat] as [number, number], // Use [lng, lat] format to match search page
        })
      );

      // Navigate to the search page with the university coordinates
      const params = new URLSearchParams({
        location: university.name,
        coordinates: `${lng},${lat}`, // Format as lng,lat for consistency
        lat: lat.toString(),
        lng: lng.toString(),
      });

      router.push(`/search?${params.toString()}`);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLocationSearch();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative h-[80vh] md:h-[80vh]">
      {/* Animated background overlay */}

      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/80 to-black/90 z-10"></div>
      {/* 
<!-- Blue gradient background --> */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-blue-600/50 to-blue-700/70 z-0"></div> */}

      {/* Subtle animation background shapes */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Background Image */}
      <Image
        src="/landing-splash.jpg"
        alt="Rentiful Rental Platform Hero Section"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Content Container */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl px-4 md:px-6"
        >
          {/* Staggered animations for text elements */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl pt-6 md:text-4xl lg:text-5xl pt-19 font-bold text-blue-500 mb-6 tracking-tight drop-shadow-lg"
            >
              Find Any Res in South Africa
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-white/60 mb-8 pb-5 max-w-2xl mx-auto font-semibold"
            >
              Explore our wide range of rental properties tailored to fit your
              lifestyle and needs!
            </motion.p>
          </div>

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-white/20"
          >
            {/* University Location Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <PropertyTypeTab
                icon={<Building size={18} />}
                label="UCT"
                isActive={activeTab === "uct"}
                onClick={() => handleUniversityClick("UCT")}
              />
              <PropertyTypeTab
                icon={<Building size={18} />}
                label="WITS"
                isActive={activeTab === "wits"}
                onClick={() => handleUniversityClick("WITS")}
              />
              <PropertyTypeTab
                icon={<Building size={18} />}
                label="UJ"
                isActive={activeTab === "uj"}
                onClick={() => handleUniversityClick("UJ")}
              />
              <PropertyTypeTab
                icon={<Building size={18} />}
                label="UKZN"
                isActive={activeTab === "ukzn"}
                onClick={() => handleUniversityClick("UKZN")}
              />
              <PropertyTypeTab
                icon={<Building size={18} />}
                label="UWC"
                isActive={activeTab === "uwc"}
                onClick={() => handleUniversityClick("UWC")}
              />
              <PropertyTypeTab
                icon={<Building size={18} />}
                label="UP"
                isActive={activeTab === "up"}
                onClick={() => handleUniversityClick("UP")}
              />
              <PropertyTypeTab
                icon={<Building size={18} />}
                label="SU"
                isActive={activeTab === "su"}
                onClick={() => handleUniversityClick("SU")}
              />
            </div>

            {/* Search Input with Animation */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
              <div className="relative flex-grow group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MapPin
                    size={20}
                    className="group-focus-within:text-secondary-500 text-blue-500 transition-colors duration-300"
                  />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by city, neighborhood or address"
                  className="w-full rounded-lg sm:rounded-r-none h-14 border-0 pl-12 pr-4 bg-white text-gray-800 text-lg placeholder-blue-600 placeholder:text-blue-500 focus-visible:ring-2 focus-visible:ring-secondary-400 transition-all duration-300 shadow-inner"
                />
              </div>
              <Button
                onClick={handleLocationSearch}
                className="h-14 px-8 bg-blue-500 hover:bg-secondary-600 text-white rounded-lg sm:rounded-l-none text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-secondary-500/30"
              >
                <Search size={20} className="mr-2" />
                Search
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Define the prop types for PropertyTypeTab component
interface PropertyTypeTabProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

// Property Type Tab Component with TypeScript props
const PropertyTypeTab: React.FC<PropertyTypeTabProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-5 py-3 flex items-center gap-2 font-medium rounded-full transition-all duration-300 ${isActive
          ? "bg-blue-500 text-white shadow-lg"
          : "bg-white/80 text-gray-800 hover:bg-white"
        }`}
    >
      {icon}
      {label}
    </motion.button>
  );
};

export default HeroSection;
