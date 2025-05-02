import React, { useState, useEffect } from 'react';
import { useGetAuthUserQuery } from '@/state/api';
import { Property } from '@/types/prismaTypes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiImageUpload } from './MultImageUpload';

// Available amenities for selection
const AMENITIES = [
  'Air Conditioning',
  'Heating',
  'Washer/Dryer',
  'Dishwasher',
  'Refrigerator',
  'Microwave',
  'Oven',
  'Pool',
  'Gym',
  'Balcony',
  'Patio',
  'Garage',
  'Parking',
  'Security System',
  'Furnished',
  'Laundry Facilities',
  'High-Speed Internet',
  'Cable Ready',
  'Fireplace',
  'Storage'
];

// Property types
const PROPERTY_TYPES = [
  'APARTMENT',
  'HOUSE',
  'CONDO',
  'TOWNHOUSE',
  'DUPLEX',
  'STUDIO',
  'LOFT'
];

interface PropertyFormProps {
  property?: Property;
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSubmit,
  isSubmitting
}) => {
  const { data: authUser } = useGetAuthUserQuery(undefined);
  const managerCognitoId = authUser?.userInfo?.cognitoId || '';
  
  // Form state
  const [title, setTitle] = useState(property?.title || '');
  const [description, setDescription] = useState(property?.description || '');
  const [propertyType, setPropertyType] = useState(property?.propertyType || 'APARTMENT');
  const [pricePerMonth, setPricePerMonth] = useState(property?.pricePerMonth?.toString() || '');
  const [securityDeposit, setSecurityDeposit] = useState(property?.securityDeposit?.toString() || '');
  const [applicationFee, setApplicationFee] = useState(property?.applicationFee?.toString() || '');
  const [beds, setBeds] = useState(property?.beds?.toString() || '');
  const [baths, setBaths] = useState(property?.baths?.toString() || '');
  const [squareFeet, setSquareFeet] = useState(property?.squareFeet?.toString() || '');
  const [isPetsAllowed, setIsPetsAllowed] = useState(property?.isPetsAllowed || false);
  const [isParkingIncluded, setIsParkingIncluded] = useState(property?.isParkingIncluded || false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(property?.amenities || []);
  const [highlights, setHighlights] = useState<string>(
    property?.highlights ? property.highlights.join('\n') : ''
  );
  
  // Location state
  const [address, setAddress] = useState(property?.location?.address || '');
  const [city, setCity] = useState(property?.location?.city || '');
  const [state, setState] = useState(property?.location?.state || '');
  const [country, setCountry] = useState(property?.location?.country || '');
  const [postalCode, setPostalCode] = useState(property?.location?.postalCode || '');
  
  // File upload state
  const [files, setFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(property?.photoUrls || []);
  const [replacePhotos, setReplacePhotos] = useState(false);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add basic info
    formData.append('title', title);
    formData.append('description', description);
    formData.append('propertyType', propertyType);
    formData.append('pricePerMonth', pricePerMonth);
    formData.append('securityDeposit', securityDeposit);
    formData.append('applicationFee', applicationFee);
    formData.append('beds', beds);
    formData.append('baths', baths);
    formData.append('squareFeet', squareFeet);
    formData.append('isPetsAllowed', isPetsAllowed.toString());
    formData.append('isParkingIncluded', isParkingIncluded.toString());
    
    // Add location info
    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('country', country);
    formData.append('postalCode', postalCode);
    
    // Add arrays
    selectedAmenities.forEach((amenity) => {
      formData.append('amenities', amenity);
    });
    
    // Process highlights - split by line and add to form data
    const highlightsArray = highlights
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    highlightsArray.forEach((highlight) => {
      formData.append('highlights', highlight);
    });
    
    // Add file data
    files.forEach((file) => {
      formData.append('photos', file);
    });
    
    // Add manager info
    formData.append('managerCognitoId', managerCognitoId);
    
    // Add photo replacement flag
    formData.append('replacePhotos', replacePhotos.toString());
    
    onSubmit(formData);
  };

  // Handle amenity toggle
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter property title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type *</Label>
            <Select
              value={propertyType}
              onValueChange={setPropertyType}
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the property"
              className="min-h-32"
              required
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Property Details */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="beds">Bedrooms *</Label>
            <Input
              id="beds"
              type="number"
              min="0"
              step="1"
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              placeholder="Number of bedrooms"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="baths">Bathrooms *</Label>
            <Input
              id="baths"
              type="number"
              min="0"
              step="0.5"
              value={baths}
              onChange={(e) => setBaths(e.target.value)}
              placeholder="Number of bathrooms"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="squareFeet">Square Feet</Label>
            <Input
              id="squareFeet"
              type="number"
              min="0"
              step="1"
              value={squareFeet}
              onChange={(e) => setSquareFeet(e.target.value)}
              placeholder="Property size in sq ft"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isPetsAllowed"
              checked={isPetsAllowed}
              onCheckedChange={setIsPetsAllowed}
            />
            <Label htmlFor="isPetsAllowed">Pets Allowed</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isParkingIncluded"
              checked={isParkingIncluded}
              onCheckedChange={setIsParkingIncluded}
            />
            <Label htmlFor="isParkingIncluded">Parking Included</Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Financial Details */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pricePerMonth">Monthly Rent ($) *</Label>
            <Input
              id="pricePerMonth"
              type="number"
              min="0"
              step="0.01"
              value={pricePerMonth}
              onChange={(e) => setPricePerMonth(e.target.value)}
              placeholder="Monthly rent amount"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
            <Input
              id="securityDeposit"
              type="number"
              min="0"
              step="0.01"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              placeholder="Security deposit amount"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="applicationFee">Application Fee ($)</Label>
            <Input
              id="applicationFee"
              type="number"
              min="0"
              step="0.01"
              value={applicationFee}
              onChange={(e) => setApplicationFee(e.target.value)}
              placeholder="Application fee amount"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Location */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State or province"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal or ZIP code"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              required
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Amenities */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Highlights */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Highlights</h2>
        <div className="space-y-2">
          <Label htmlFor="highlights">
            Property Highlights (One per line)
          </Label>
          <Textarea
            id="highlights"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            placeholder="Enter key highlights of the property (one per line)"
            className="min-h-32"
          />
          <p className="text-sm text-gray-500">
            Add special features or selling points, one per line
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Photos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Property Photos</h2>
        
        {existingPhotos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Current Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingPhotos.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center space-x-2">
              <Switch
                id="replacePhotos"
                checked={replacePhotos}
                onCheckedChange={setReplacePhotos}
              />
              <Label htmlFor="replacePhotos">
                Replace existing photos (uncheck to add to existing photos)
              </Label>
            </div>
          </div>
        )}
        
        <MultiImageUpload
          files={files}
          setFiles={setFiles}
          maxFiles={10}
          acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
        />
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;