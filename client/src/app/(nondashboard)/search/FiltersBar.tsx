"use client"

import { type FiltersState, setFilters, setViewMode, toggleFiltersFullOpen } from "@/state"
import { useAppSelector } from "@/state/redux"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { debounce } from "lodash"
import { cleanParams, cn, formatPriceValue } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Grid, List, Search, X, SlidersHorizontal, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertyTypeIcons } from "@/lib/constants"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

// Define MapboxFeature interface outside of any function
interface MapboxFeature {
  center: [number, number];
  place_name: string;
  context?: Array<{
    id: string;
    short_code: string;
  }>;
  id?: string;
  short_code?: string;
}

const FiltersBar = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const filters = useAppSelector((state) => state.global.filters)
  const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen)
  const viewMode = useAppSelector((state) => state.global.viewMode)
  const [searchInput, setSearchInput] = useState(filters.location || "")
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const isMobile = useIsMobile()

  // Calculate active filters count
  useEffect(() => {
    let count = 0

    if (filters.location && filters.location !== "any") count++
    if (filters.priceRange[0] !== null) count++
    if (filters.priceRange[1] !== null) count++
    if (filters.beds !== "any") count++
    if (filters.baths !== "any") count++
    if (filters.propertyType !== "any") count++

    setActiveFilterCount(count)
  }, [filters])

  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters)
    const updatedSearchParams = new URLSearchParams()

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(key, Array.isArray(value) ? value.join(",") : value.toString())
    })

    router.push(`${pathname}?${updatedSearchParams.toString()}`)
  }, 300)

  const handleFilterChange = (key: string, value: any, isMin: boolean | null) => {
    let newValue = value

    if (key === "priceRange" || key === "squareFeet") {
      const currentArrayRange = [...filters[key]]
      if (isMin !== null) {
        const index = isMin ? 0 : 1
        currentArrayRange[index] = value === "any" ? null : Number(value)
      }
      newValue = currentArrayRange
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : value.map(Number)
    } else {
      newValue = value === "any" ? "any" : value
    }

    const newFilters = { ...filters, [key]: newValue }
    dispatch(setFilters(newFilters))
    updateURL(newFilters)
  }

  const handleLocationSearch = async () => {
    try {
      // Don't search if input is empty
      if (!searchInput.trim()) return
      
      // Always append South Africa to the search query if not already present
      let searchQuery = searchInput.trim()
      if (!searchQuery.toLowerCase().includes('south africa')) {
        searchQuery += ', South Africa'
      }

      console.log('Searching for location:', searchQuery)
      
      // Search for locations with South Africa context and country restriction
      // Adding country=za parameter to restrict results to South Africa
      // Adding types parameter to prioritize place,region,locality,neighborhood for better city/township matching
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true&types=place,locality,neighborhood,region,address&country=za&limit=5&language=en`,
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        // Find the best match for South African locations
        // First try to find townships or places specifically in South Africa
        const southAfricanFeatures = data.features.filter((feature: MapboxFeature) => {
          // Check if this is explicitly a South African location
          const isSouthAfrican = feature.place_name.toLowerCase().includes('south africa') ||
            (feature.context && feature.context.some(ctx => 
              ctx.id.startsWith('country') && ctx.short_code === 'za'
            ))
          return isSouthAfrican
        })
        
        // Use South African results if available, otherwise fall back to the first result
        const feature = southAfricanFeatures.length > 0 ? southAfricanFeatures[0] : data.features[0];
        console.log('Selected location:', feature.place_name)
        const [lng, lat] = feature.center
        
        // Extract just the place name without country
        const locationName = feature.place_name.split(',')[0];
        
        const newFilters = {
          ...filters,
          location: locationName,
          coordinates: [lng, lat] as [number, number],
        }
        dispatch(setFilters(newFilters))
        updateURL(newFilters)
      }
    } catch (err) {
      console.error("Error searching location:", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLocationSearch()
    }
  }

  const resetFilters = () => {
    const defaultFilters: FiltersState = {
      location: "",
      coordinates: [0, 0],
      priceRange: [null, null],
      beds: "any",
      baths: "any",
      propertyType: "any",
      squareFeet: [null, null],
      amenities: [],
      availableFrom: "",
    }

    dispatch(setFilters(defaultFilters))
    setSearchInput("")
    updateURL(defaultFilters)
  }

  const renderFilterControls = () => (
    <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-3 w-full">
      {/* Search Location */}
      <div className="relative w-full md:w-auto md:flex-grow md:max-w-xs">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-blue-300" />
        </div>
        <Input
          placeholder="Search location in South Africa"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm"
        />
        {searchInput && (
          <Button
            onClick={() => setSearchInput("")}
            className="absolute inset-y-0 right-0 px-3 rounded-l-none rounded-full bg-transparent hover:bg-transparent"
          >
            <X className="w-4 h-4 text-blue-300 hover:text-slate-700" />
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="flex items-center gap-4 ml-2">
        <Select
          value={filters.priceRange[0]?.toString() || "any"}
          onValueChange={(value) => handleFilterChange("priceRange", value, true)}
        >
          <SelectTrigger className="w-32 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm">
            <SelectValue className="mr-4">{formatPriceValue(filters.priceRange[0], true)}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white ">
            <SelectItem value="any">Min Price</SelectItem>
            {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
              <SelectItem key={price} value={price.toString()}>
                R{price / 1000}k+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priceRange[1]?.toString() || "any"}
          onValueChange={(value) => handleFilterChange("priceRange", value, false)}
        >
          <SelectTrigger className="w-32 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm">
            <SelectValue className="pr-4">{formatPriceValue(filters.priceRange[1], false)}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="any">Max Price</SelectItem>
            {[1000, 2000, 3000, 5000, 10000].map((price) => (
              <SelectItem key={price} value={price.toString()}>
                &lt;R{price / 1000}k
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Beds */}
      <Select value={filters.beds} onValueChange={(value) => handleFilterChange("beds", value, null)}>
        <SelectTrigger className="w-24 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm">
          <SelectValue placeholder="Beds" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="any">Beds</SelectItem>
          <SelectItem value="1">1+ bed</SelectItem>
          <SelectItem value="2">2+ beds</SelectItem>
          <SelectItem value="3">3+ beds</SelectItem>
          <SelectItem value="4">4+ beds</SelectItem>
        </SelectContent>
      </Select>

      {/* Baths */}
      <Select value={filters.baths} onValueChange={(value) => handleFilterChange("baths", value, null)}>
        <SelectTrigger className="w-24 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm">
          <SelectValue placeholder="Baths" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="any">Baths</SelectItem>
          <SelectItem value="1">1+ bath</SelectItem>
          <SelectItem value="2">2+ baths</SelectItem>
          <SelectItem value="3">3+ baths</SelectItem>
        </SelectContent>
      </Select>

      {/* Property Type */}
      <Select
        value={filters.propertyType || "any"}
        onValueChange={(value) => handleFilterChange("propertyType", value, null)}
      >
        <SelectTrigger className="w-32 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm">
          <SelectValue placeholder="Home Type" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="any">Home Type</SelectItem>
          {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
            <SelectItem key={type} value={type}>
              <div className="flex items-center">
                <Icon className="w-4 h-4 mr-2" />
                <span className="capitalize">{type}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="sticky top-0 z-10 bg-white backdrop-blur-md bg-opacity-95 shadow-lg px-4 py-3 rounded-xl border border-blue-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
        {/* Mobile View */}
        {isMobile ? (
          <div className="flex w-full items-center justify-between gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-blue-300" />
              </div>
              <Input
                placeholder="Search location"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-10 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm"
              />
              {searchInput && (
                <Button
                  onClick={() => setSearchInput("")}
                  className="absolute inset-y-0 right-0 px-3 rounded-l-none rounded-full bg-transparent hover:bg-transparent"
                >
                  <X className="w-4 h-4 text-blue-300 hover:text-slate-700" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filters Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "gap-2 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm relative",
                      isFiltersFullOpen && "bg-blue-500 text-white hover:bg-blue-600",
                    )}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {activeFilterCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your property search</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 overflow-y-auto max-h-[calc(85vh-180px)] pb-4">
                    {renderFilterControls()}
                  </div>

                  <SheetFooter className="flex-row justify-between border-t pt-4 mt-2">
                    {activeFilterCount > 0 && (
                      <Button
                        variant="outline"
                        className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={resetFilters}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear all
                      </Button>
                    )}
                    <SheetClose asChild>
                      <Button className="rounded-full bg-blue-500 hover:bg-blue-600 ml-auto">Apply filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* View Mode Selector */}
              <div className="flex border rounded-full shadow-sm overflow-hidden bg-blue-50">
                <Button
                  variant="ghost"
                  className={cn(
                    "px-2 py-1 rounded-none hover:bg-blue-500 hover:text-white transition-all",
                    viewMode === "list" ? "bg-blue-500 text-white" : "",
                  )}
                  onClick={() => dispatch(setViewMode("list"))}
                >
                  <List className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  className={cn(
                    "px-2 py-1 rounded-none hover:bg-blue-500 hover:text-white transition-all",
                    viewMode === "grid" ? "bg-blue-500 text-white" : "",
                  )}
                  onClick={() => dispatch(setViewMode("grid"))}
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop View */
          <>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* All Filters Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "gap-2 rounded-full border-blue-200 bg-blue-50 hover:bg-white focus:bg-white transition-all shadow-sm relative",
                        isFiltersFullOpen && "bg-blue-500 text-white hover:bg-blue-600",
                      )}
                      onClick={() => dispatch(toggleFiltersFullOpen())}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span className="hidden sm:inline">Filters</span>
                      {activeFilterCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open advanced filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {renderFilterControls()}

              {/* Reset Button */}
              {activeFilterCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full hover:bg-red-50 hover:text-red-600 ml-1"
                        onClick={resetFilters}
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Clear</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset all filters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* View Mode Selector */}
            <div className="flex ml-auto">
              <div className="flex border rounded-full shadow-sm overflow-hidden bg-blue-50">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "px-3 py-1 rounded-none hover:bg-blue-500 hover:text-white transition-all",
                          viewMode === "list" ? "bg-blue-500 text-white" : "",
                        )}
                        onClick={() => dispatch(setViewMode("list"))}
                      >
                        <List className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>List view</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "px-3 py-1 rounded-none hover:bg-blue-500 hover:text-white transition-all",
                          viewMode === "grid" ? "bg-blue-500 text-white" : "",
                        )}
                        onClick={() => dispatch(setViewMode("grid"))}
                      >
                        <Grid className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Grid view</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FiltersBar
