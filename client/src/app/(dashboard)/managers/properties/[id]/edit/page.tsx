// --- BEGIN FILE: app/managers/properties/edit/[id]/page.tsx ---
"use client";

import React, { useEffect, useState as usePageState } from "react";
import { useForm as usePropertyForm } from "react-hook-form";
import { zodResolver as zodPropertyResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

// UI Components
import { Form as PropertyFormUI } from "@/components/ui/form";
import { Button as UIButton } from "@/components/ui/button";
import { Input as UIInput } from "@/components/ui/input";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox";
import { Label as UILabel } from "@/components/ui/label";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
  Dialog as UIDialog,
  DialogContent as UIDialogContent,
  DialogHeader as UIDialogHeader,
  DialogTitle as UIDialogTitle,
  DialogDescription as UIDialogDescription,
  DialogFooter as UIDialogFooter,
  DialogTrigger as UIDialogTrigger,
  DialogClose as UIDialogClose,
} from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";

// Custom Components

import { PropertyEditPageRoomFormModal } from "@/components/PropretyEditPageRoomFormModal";

// Icons
import {
  Building, Home, MapPin, CheckIcon, ChevronDown, ChevronUp, Sparkles, Upload as UploadIcon, Loader2, ArrowLeft, ImageDown, XIcon, CircleDollarSign, Trash2, Edit3, PlusCircle, BedDouble, Bath, Ruler, XCircle as XCircleIcon
} from "lucide-react";

// Schemas, Types, Constants, and API Hooks
import { PropertyFormData, propertySchema } from "@/lib/schemas";
import { RoomFormData } from "@/lib/schemas"; // Use for typing
import { PropertyTypeEnum, AmenityEnum, HighlightEnum } from "@/lib/constants";
import { ApiProperty, ApiRoom } from "@/lib/schemas"; // Use defined API types
import {
  useGetPropertyQuery,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetRoomsQuery,
  useDeleteRoomMutation, // Import delete hook for rooms
} from "@/state/api"; // Use the re-exported hooks
import { CreateFormFieldt } from "@/components/CreateFormFieldT";

// FormSection Component
interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
}
const FormSection = ({ title, icon, children, defaultOpen = false, actions }: FormSectionProps) => {
  const [isOpen, setIsOpen] = usePageState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mb-6 shadow-md dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-700/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg dark:bg-primary/20">{icon}</div>
          <h2 className="text-xl font-semibold text-foreground dark:text-gray-100">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <div className="text-muted-foreground dark:text-gray-400">{isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="p-4 md:p-6 border-t border-border dark:border-gray-700 bg-card dark:bg-gray-800">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
// End FormSection

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyIdString = params?.id as string;
  const propertyIdNumber = Number(propertyIdString);

  const [isOverallPageLoading, setIsOverallPageLoading] = usePageState(true);

  // Property Photos State
  const [currentPropertyPhotos, setCurrentPropertyPhotos] = usePageState<string[]>([]);
  const [newPropertyPhotoFiles, setNewPropertyPhotoFiles] = usePageState<FileList | null>(null);
  const [propertyPhotosMarkedForDelete, setPropertyPhotosMarkedForDelete] = usePageState<string[]>([]);
  const [replacePropertyPhotosFlag, setReplacePropertyPhotosFlag] = usePageState(false);

  // Room Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = usePageState(false);
  const [editingRoomInitialData, setEditingRoomInitialData] = usePageState<Partial<RoomFormData> | null>(null);

  // RTK Query Hooks
  const { data: fetchedPropertyData, isLoading: isLoadingProperty, isError: isPropertyError, refetch: refetchProperty } = useGetPropertyQuery(propertyIdNumber, { skip: !propertyIdNumber || isNaN(propertyIdNumber) });
  const [updateProperty, { isLoading: isUpdatingProperty }] = useUpdatePropertyMutation();
  const [deleteProperty, { isLoading: isDeletingProperty }] = useDeletePropertyMutation();

  const { data: fetchedRoomsData, isLoading: isLoadingRooms, isError: isRoomsError, error: roomsError, refetch: refetchRooms } = useGetRoomsQuery(propertyIdNumber, { 
    skip: !propertyIdNumber || isNaN(propertyIdNumber)
  });

  useEffect(() => {
    if (fetchedRoomsData && !isLoadingRooms) {
      console.log("Rooms fetched successfully:", fetchedRoomsData);
    }
  }, [fetchedRoomsData, isLoadingRooms]);

  useEffect(() => {
    if (isRoomsError) {
      console.error("Error fetching rooms:", roomsError);
    }
  }, [isRoomsError, roomsError]);

  const [deleteRoom, { isLoading: isDeletingRoom }] = useDeleteRoomMutation();

  const propertyForm = usePropertyForm<PropertyFormData>({
    resolver: zodPropertyResolver(propertySchema),
    defaultValues: { /* Populated in useEffect */ },
  });

  useEffect(() => {
    if (fetchedPropertyData) {
      propertyForm.reset({
        name: fetchedPropertyData.name || "",
        description: fetchedPropertyData.description || "",
        pricePerMonth: fetchedPropertyData.pricePerMonth || 0,
        securityDeposit: fetchedPropertyData.securityDeposit ?? undefined, // Use undefined for optional numbers
        applicationFee: fetchedPropertyData.applicationFee ?? undefined, // Use undefined for optional numbers
        isPetsAllowed: fetchedPropertyData.isPetsAllowed || false,
        isParkingIncluded: fetchedPropertyData.isParkingIncluded || false,
        amenities: fetchedPropertyData.amenities || [],
        highlights: fetchedPropertyData.highlights || [],
        propertyType: fetchedPropertyData.propertyType || PropertyTypeEnum.Apartment,
        beds: fetchedPropertyData.beds || 0,
        baths: fetchedPropertyData.baths || 0,
        squareFeet: fetchedPropertyData.squareFeet ?? undefined, // Use undefined for optional numbers
        address: fetchedPropertyData.location?.address || "",
        city: fetchedPropertyData.location?.city || "",
        state: fetchedPropertyData.location?.state || "",
        country: fetchedPropertyData.location?.country || "",
        postalCode: fetchedPropertyData.location?.postalCode || "",
      });
      setCurrentPropertyPhotos(fetchedPropertyData.photoUrls || []);
      setNewPropertyPhotoFiles(null);
      setPropertyPhotosMarkedForDelete([]);
      setReplacePropertyPhotosFlag(false);
      setIsOverallPageLoading(false);
    }
  }, [fetchedPropertyData, propertyForm]);

  useEffect(() => {
    if (isPropertyError && !isLoadingProperty) {
      toast.error("Failed to load property data. It might not exist or an error occurred.");
      router.push("/managers/properties");
    }
  }, [isPropertyError, isLoadingProperty, router]);

  const handlePropertyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPropertyPhotoFiles(e.target.files);
  };

  const togglePropertyPhotoForDelete = (url: string) => {
    setPropertyPhotosMarkedForDelete(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const onSubmitPropertyHandler = async (data: PropertyFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (key === "amenities" || key === "highlights") {
            if (Array.isArray(value) && value.length > 0) formData.append(key, value.join(','));
            // Omit if empty array, unless backend requires empty string
        } else if (typeof value === 'boolean') {
            formData.append(key, String(value));
        } else if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
        } else if (key === 'squareFeet' || key === 'securityDeposit' || key === 'applicationFee') { // Handle optional numbers that might be 0
             if (typeof value === 'number' && value === 0) {
                 formData.append(key, '0');
             } // If null/undefined, don't append
        }
    });


    if (newPropertyPhotoFiles) {
      Array.from(newPropertyPhotoFiles).forEach(file => formData.append("photos", file));
    }
    formData.append("replacePhotos", String(replacePropertyPhotosFlag));

    // Handle sending the final list of photo URLs if NOT replacing all
    if (!replacePropertyPhotosFlag) {
        const keptPhotoUrls = currentPropertyPhotos.filter(url => !propertyPhotosMarkedForDelete.includes(url));
        // Send this list to backend. Backend needs to be modified to use this field
        // when replacePhotos is false to correctly handle selective deletions.
        formData.append('photoUrls', JSON.stringify(keptPhotoUrls));
    }


    try {
      await updateProperty({ id: propertyIdString, body: formData }).unwrap();
      toast.success("Property updated successfully!");
      refetchProperty();
      refetchRooms();
      setNewPropertyPhotoFiles(null);
      setPropertyPhotosMarkedForDelete([]);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update property.");
    }
  };

  const handleDeleteProperty = async () => {
    try {
      await deleteProperty({ id: propertyIdNumber, managerCognitoId: fetchedPropertyData?.managerCognitoId }).unwrap();
      toast.success("Property deleted successfully!");
      router.push("/managers/properties");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete property.");
    }
  };

  const openRoomModalForCreate = () => {
    setEditingRoomInitialData(null);
    setIsRoomModalOpen(true);
  };

  const openRoomModalForEdit = (roomFromApi: ApiRoom) => {
    const roomFormDataForModal: Partial<RoomFormData> = {
        propertyId: roomFromApi.propertyId,
        name: roomFromApi.name,
        description: roomFromApi.description || "",
        photoUrls: roomFromApi.photoUrls || [],
        pricePerMonth: roomFromApi.pricePerMonth,
        securityDeposit: roomFromApi.securityDeposit ?? undefined,
        squareFeet: roomFromApi.squareFeet ?? undefined,
        isAvailable: roomFromApi.isAvailable,
        availableFrom: roomFromApi.availableFrom ? new Date(roomFromApi.availableFrom) : null,
        roomType: roomFromApi.roomType,
        capacity: roomFromApi.capacity ?? 1,
        amenities: roomFromApi.amenities || [],
        features: roomFromApi.features || [],
    };
    setEditingRoomInitialData(roomFormDataForModal);
    setIsRoomModalOpen(true);
  };

  const handleDeleteRoomFromList = async (roomId: number, roomName: string) => {
      try {
          await deleteRoom({ id: roomId }).unwrap();
          toast.success(`Room "${roomName}" deleted successfully!`);
          refetchRooms();
      } catch (error: any) {
          toast.error(error?.data?.message || "Failed to delete room.");
      }
  };


  if (isOverallPageLoading || isLoadingProperty) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background dark:bg-gray-900 p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground dark:text-gray-400">Loading Property Details...</p>
      </div>
    );
  }

  if (isPropertyError || !fetchedPropertyData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background dark:bg-gray-900 p-6 text-center">
        <XCircleIcon className="h-20 w-20 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Error Loading Property</h2>
        <p className="text-lg text-muted-foreground dark:text-gray-400 mb-8">
          The property data could not be loaded. It might have been deleted, or an unexpected error occurred.
        </p>
        <UIButton onClick={() => router.push("/managers/properties")} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" /> Go Back to Properties
        </UIButton>
      </div>
    );
  }

  const isAnyMutationLoading = isUpdatingProperty || isDeletingProperty || isDeletingRoom;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-foreground dark:text-gray-200 p-4 md:p-8">
      <Toaster richColors position="top-center" duration={4000} />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UIButton variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </UIButton>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Property</h1>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1 truncate max-w-md">
                {fetchedPropertyData?.name || "Loading name..."}
              </p>
            </div>
          </div>
          <UIDialog>
            <UIDialogTrigger asChild>
              <UIButton variant="destructive" disabled={isAnyMutationLoading} className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Property
              </UIButton>
            </UIDialogTrigger>
            <UIDialogContent className="dark:bg-gray-800 dark:border-gray-700">
              <UIDialogHeader>
                <UIDialogTitle className="dark:text-gray-100">Are you absolutely sure?</UIDialogTitle>
                <UIDialogDescription className="dark:text-gray-400">
                  This action cannot be undone. This will permanently delete the property
                  and all its associated data, including rooms and photos from the database and S3.
                </UIDialogDescription>
              </UIDialogHeader>
              <UIDialogFooter className="mt-4">
                <UIDialogClose asChild><UIButton variant="outline">Cancel</UIButton></UIDialogClose>
                <UIButton variant="destructive" onClick={handleDeleteProperty} disabled={isDeletingProperty}>
                  {isDeletingProperty && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yes, delete property
                </UIButton>
              </UIDialogFooter>
            </UIDialogContent>
          </UIDialog>
        </div>

        {/* Main Property Form */}
        <PropertyFormUI {...propertyForm}>
          <form onSubmit={propertyForm.handleSubmit(onSubmitPropertyHandler)} className="space-y-0">
            {/* Basic Information */}
            <FormSection title="Basic Information" icon={<Building size={20} />} defaultOpen={true}>
              <div className="space-y-6">
                <CreateFormFieldt name="name" label="Property Name" control={propertyForm.control} placeholder="e.g., The Grand Residence" />
                <CreateFormFieldt name="description" label="Description" type="textarea" control={propertyForm.control} placeholder="Detailed description of the property and its unique selling points..." inputClassName="min-h-[150px]" />
                <CreateFormFieldt name="propertyType" label="Property Type" type="select" control={propertyForm.control} options={Object.values(PropertyTypeEnum).map(type => ({ value: type, label: type }))} />
              </div>
            </FormSection>

            {/* Pricing & Fees */}
             <FormSection title="Pricing & Fees" icon={<CircleDollarSign size={20} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <div className="relative">
                  {/* Use CreateFormFieldt */}
                  <CreateFormFieldt name="pricePerMonth" label="Monthly Rent" type="number" control={propertyForm.control} min={0} inputClassName="pl-8" placeholder="0.00" />
                  <span className="absolute top-[2.3rem] left-3 text-muted-foreground font-medium dark:text-gray-400">R</span>
                </div>
                <div className="relative">
                   {/* Use CreateFormFieldt */}
                  <CreateFormFieldt name="securityDeposit" label="Security Deposit" type="number" control={propertyForm.control} min={0} inputClassName="pl-8" placeholder="0.00" />
                  <span className="absolute top-[2.3rem] left-3 text-muted-foreground font-medium dark:text-gray-400">R</span>
                </div>
                <div className="relative">
                   {/* Use CreateFormFieldt */}
                  <CreateFormFieldt name="applicationFee" label="Application Fee" type="number" control={propertyForm.control} min={0} inputClassName="pl-8" placeholder="0.00" />
                  <span className="absolute top-[2.3rem] left-3 text-muted-foreground font-medium dark:text-gray-400">R</span>
                </div>
              </div>
            </FormSection>

            {/* Property Features & Specs */}
            <FormSection title="Property Features & Specs" icon={<Home size={20} />}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                  <CreateFormFieldt name="beds" label="Total Bedrooms (Property)" type="number" control={propertyForm.control} min={0} />
                  <CreateFormFieldt name="baths" label="Total Bathrooms (Property)" type="number" control={propertyForm.control} min={0} />
                  <CreateFormFieldt name="squareFeet" label="Total Square Feet (Property)" type="number" control={propertyForm.control} min={0} placeholder="e.g., 2500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 items-center pt-2">
                  <CreateFormFieldt name="isPetsAllowed" label="Pets Allowed on Property" type="switch" control={propertyForm.control} />
                  <CreateFormFieldt name="isParkingIncluded" label="Parking Included with Property" type="switch" control={propertyForm.control} />
                </div>
              </div>
            </FormSection>

            {/* Property Amenities & Highlights */}
            <FormSection title="Property Amenities & Highlights" icon={<Sparkles size={20} />}>
              <div className="space-y-6">
                <CreateFormFieldt name="amenities" label="Property-Wide Amenities" type="multi-select" control={propertyForm.control} options={Object.values(AmenityEnum).map(amenity => ({ value: amenity, label: amenity }))} description="Select all amenities that apply to the entire property."/>
                <CreateFormFieldt name="highlights" label="Key Property Highlights" type="multi-select" control={propertyForm.control} options={Object.values(HighlightEnum).map(highlight => ({ value: highlight, label: highlight }))} description="Select distinctive features or selling points."/>
              </div>
            </FormSection>

            {/* Property Photos */}
            <FormSection title="Property Photos" icon={<ImageDown size={20} />}>
                <div className="space-y-5">
                    <div>
                        <UILabel htmlFor="propertyPhotosFile" className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1.5">Upload New Photos</UILabel>
                        <UIInput id="propertyPhotosFile" type="file" multiple onChange={handlePropertyFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-primary/30 dark:file:text-primary-foreground dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"/>
                        <div className="mt-3 flex items-center space-x-2">
                            <UICheckbox id="replacePropertyPhotosFlag" checked={replacePropertyPhotosFlag} onCheckedChange={(checked) => setReplacePropertyPhotosFlag(Boolean(checked))} className="dark:border-gray-600 dark:data-[state=checked]:bg-primary" />
                            <UILabel htmlFor="replacePropertyPhotosFlag" className="text-xs font-normal text-muted-foreground dark:text-gray-400">Replace all existing photos with new uploads</UILabel>
                        </div>
                         <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
                            If &quot;Replace all&quot; is unchecked, new photos will be added. To remove specific old photos without replacing all, your backend needs to support selective deletion via an update. Otherwise, only &quot;Replace all&quot; or deleting the entire property will remove old photos from S3.
                        </p>
                    </div>

                    {newPropertyPhotoFiles && Array.from(newPropertyPhotoFiles).length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">New photos preview ({Array.from(newPropertyPhotoFiles).length}):</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {Array.from(newPropertyPhotoFiles).map((file, index) => (
                                <div key={index} className="relative aspect-video bg-muted dark:bg-gray-700 rounded-md overflow-hidden shadow">
                                    <Image src={URL.createObjectURL(file)} alt={`New Property Preview ${index}`} layout="fill" objectFit="cover" />
                                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentPropertyPhotos.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">Current Photos ({currentPropertyPhotos.length}):</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {currentPropertyPhotos.map((url, index) => (
                                <div key={url} className="relative aspect-video bg-muted dark:bg-gray-700 rounded-md group overflow-hidden shadow">
                                    <Image src={url} alt={`Property Photo ${index + 1}`} layout="fill" objectFit="cover" />
                                    <UIButton type="button" variant="secondary" size="icon"
                                        onClick={() => togglePropertyPhotoForDelete(url)}
                                        className={`absolute top-1.5 right-1.5 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-150
                                                    ${propertyPhotosMarkedForDelete.includes(url) ? '!opacity-100 bg-green-500 hover:bg-green-600 text-white' : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'}`}>
                                        {propertyPhotosMarkedForDelete.includes(url) ? <CheckIcon size={16} /> : <Trash2 size={16} />}
                                    </UIButton>
                                    {propertyPhotosMarkedForDelete.includes(url) && <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md"><UIBadge variant="destructive">Marked</UIBadge></div>}
                                </div>
                                ))}
                            </div>
                            {propertyPhotosMarkedForDelete.length > 0 && !replacePropertyPhotosFlag && (
                                <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                                    ({propertyPhotosMarkedForDelete.length}) photo(s) marked. Actual removal if not &quot;Replacing all&quot; depends on backend update logic.
                                </p>
                            )}
                        </div>
                    )}
                     {currentPropertyPhotos.length === 0 && (!newPropertyPhotoFiles || Array.from(newPropertyPhotoFiles).length === 0) && (
                        <p className="text-sm text-muted-foreground dark:text-gray-400">No photos uploaded for this property yet.</p>
                     )}
                </div>
            </FormSection>

            {/* Location Information */}
            <FormSection title="Location Information" icon={<MapPin size={20} />}>
              <div className="space-y-6">
                <CreateFormFieldt name="address" label="Street Address" control={propertyForm.control} placeholder="123 Main St, Apt 4B" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <CreateFormFieldt name="city" label="City" control={propertyForm.control} placeholder="e.g., Cape Town" />
                  <CreateFormFieldt name="state" label="State/Province (Optional)" control={propertyForm.control} placeholder="e.g., Western Cape" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <CreateFormFieldt name="postalCode" label="Postal Code (Optional)" control={propertyForm.control} placeholder="e.g., 8001" />
                  <CreateFormFieldt name="country" label="Country" control={propertyForm.control} placeholder="e.g., South Africa" />
                </div>
                 <p className="text-xs text-muted-foreground dark:text-gray-400">Note: Changing address details will re-geocode the location and update its coordinates on the map upon saving.</p>
              </div>
            </FormSection>

            {/* Rooms Management Section */}
            <FormSection title="Manage Rooms" icon={<BedDouble size={20} />} actions={
              <UIButton type="button" variant="outline" size="sm" onClick={openRoomModalForCreate} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Room
              </UIButton>
            }>
              {isLoadingRooms && <div className="flex items-center justify-center p-6"><Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />Loading rooms...</div>}
              {!isLoadingRooms && (!fetchedRoomsData || fetchedRoomsData.length === 0) && (
                <p className="text-center text-muted-foreground dark:text-gray-400 py-6">No rooms have been added to this property yet. Click &quot;Add New Room&quot; to get started.</p>
              )}
              {fetchedRoomsData && fetchedRoomsData.length > 0 && (
                <div className="space-y-4">
                  {(fetchedRoomsData as ApiRoom[]).map((room) => (
                    <div key={room.id} className="p-4 border dark:border-gray-700 rounded-lg bg-muted/30 dark:bg-gray-700/30 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-grow">
                        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{room.name} <UIBadge variant={room.isAvailable ? "default" : "secondary"} className={`ml-2 ${room.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'}`}>{room.isAvailable ? "Available" : "Unavailable"}</UIBadge></h4>
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">
                          Type: {room.roomType} | Capacity: {room.capacity || 'N/A'} | R{room.pricePerMonth}/month
                        </p>
                        {room.photoUrls && room.photoUrls.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {room.photoUrls.slice(0, 4).map(url => (
                                    <Image key={url} src={url} alt={`${room.name} photo`} width={40} height={40} className="rounded object-cover h-10 w-10 border dark:border-gray-600"/>
                                ))}
                                {room.photoUrls.length > 4 && <div className="h-10 w-10 rounded bg-slate-200 dark:bg-gray-600 flex items-center justify-center text-xs text-slate-600 dark:text-gray-300 border dark:border-gray-500">+{room.photoUrls.length - 4}</div>}
                            </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                        <UIButton type="button" variant="outline" size="sm" onClick={() => openRoomModalForEdit(room)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                          <Edit3 size={16} className="mr-1.5" /> Edit
                        </UIButton>
                         <UIDialog>
                            <UIDialogTrigger asChild>
                               <UIButton type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-red-700/20"><Trash2 size={16} className="mr-1.5" /> Delete</UIButton>
                            </UIDialogTrigger>
                            <UIDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                                <UIDialogHeader><UIDialogTitle className="dark:text-gray-100">Delete Room: &quot;{room.name}&quot;?</UIDialogTitle></UIDialogHeader>
                                <UIDialogDescription className="dark:text-gray-400">This will permanently delete this room and all its photos from S3. This action cannot be undone.</UIDialogDescription>
                                <UIDialogFooter className="mt-4">
                                    <UIDialogClose asChild><UIButton variant="outline">Cancel</UIButton></UIDialogClose>
                                    <UIButton variant="destructive" onClick={() => handleDeleteRoomFromList(room.id, room.name)} disabled={isDeletingRoom}>
                                        {isDeletingRoom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete Room
                                    </UIButton>
                                </UIDialogFooter>
                            </UIDialogContent>
                        </UIDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>

            {/* Sticky Submit Footer */}
            <div className="sticky bottom-0 bg-background/90 dark:bg-gray-800/90 backdrop-blur-sm py-5 mt-10 border-t dark:border-gray-700 shadow-lg">
              <div className="max-w-6xl mx-auto flex justify-end px-4">
                <UIButton type="submit" size="lg" className="min-w-[180px] text-base" disabled={isAnyMutationLoading}>
                  {isUpdatingProperty && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Save All Property Changes
                </UIButton>
              </div>
            </div>
          </form>
        </PropertyFormUI>

        {/* Room Modal */}
        <PropertyEditPageRoomFormModal
          isOpen={isRoomModalOpen}
          onClose={() => { setIsRoomModalOpen(false); setEditingRoomInitialData(null); }}
          propertyId={propertyIdString} // Pass string ID to modal
          initialRoomData={editingRoomInitialData}
          onSaveSuccess={(savedRoomData) => { // Expect the actual saved room data object
            refetchRooms(); // Refetch the list of rooms after save
            // The toast is now handled within the modal's submit handler
            // toast.success(`Room "${savedRoomData.name}" ${editingRoomInitialData?.id ? 'updated' : 'created'} successfully!`);
          }}
        />
      </div>
    </div>
  );
}
// --- END FILE: app/managers/properties/edit/[id]/page.tsx ---