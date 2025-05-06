"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import Image from "next/image";
// Components
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CreateFormField } from "@/components/CreateFormField";
import { CustomFormField } from "@/components/FormField";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  Building,
  Home,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Coffee,
  Upload,
  Loader2,
  ArrowLeft,
  ImageDown,
  X,
  CircleDollarSign,
} from "lucide-react";

// Data & API
import { type PropertyFormData, propertySchema } from "@/lib/schemas";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";
import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";

// Section component for form sections with collapsible functionality
interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FormSection = ({
  title,
  icon,
  children,
  defaultOpen = false,
}: FormSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#0B1120]/80 border border-[#1E2A45] rounded-lg overflow-hidden mb-6 shadow-lg">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1E2A45] rounded-lg text-[#4F9CF9]">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="text-gray-400">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-[#1E2A45] bg-[#0B1120]/60">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main component
const NewProperty = () => {
  const [createProperty, { isLoading }] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const router = useRouter();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      pricePerMonth: 1000,
      securityDeposit: 500,
      applicationFee: 100,
      isPetsAllowed: true,
      isParkingIncluded: true,
      photoUrls: [],
      amenities: [],
      highlights: [],
      propertyType: PropertyTypeEnum.Apartment,
      beds: 1,
      baths: 1,
      squareFeet: 1000,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  // Handle file selection to show preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const files = Array.from(e.target.files);
      setUploadedFiles(files);
    }
  };

  // Handle removing an amenity
  const handleRemoveAmenity = (amenityToRemove: string) => {
    const currentAmenities = form.getValues("amenities") || [];
    const updatedAmenities = currentAmenities.filter(
      (amenity) => amenity !== amenityToRemove
    );
    form.setValue("amenities", updatedAmenities);
  };

  // Handle removing a highlight
  const handleRemoveHighlight = (highlightToRemove: string) => {
    const currentHighlights = form.getValues("highlights") || [];
    const updatedHighlights = currentHighlights.filter(
      (highlight) => highlight !== highlightToRemove
    );
    form.setValue("highlights", updatedHighlights);
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      if (!authUser?.cognitoInfo?.userId) {
        toast.error("You must be logged in to create a property", {
          className: "bg-red-500 text-white",
          duration: 4000,
        });
        return;
      }

      // Create FormData object
      const formData = new FormData();

      // Add all basic fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "photoUrls") {
          // Handle files separately
          const files = value as unknown as FileList;
          if (files && files.length) {
            Array.from(files).forEach((file: File) => {
              formData.append("photos", file);
            });
          }
        } else if (key === "amenities" || key === "highlights") {
          // Handle arrays - ensure they're converted to strings
          if (Array.isArray(value)) {
            formData.append(key, value.join(","));
          }
        } else {
          // Handle all other fields - ensure they're strings
          formData.append(key, String(value));
        }
      });

      // Add manager ID
      formData.append("managerCognitoId", authUser.cognitoInfo.userId);

      // Send the request
      await createProperty(formData).unwrap();

      // Show success message
      toast.success("Property created successfully!", {
        className: "bg-[#0070F3] text-white font-medium",
        position: "top-center",
        duration: 4000,
      });

      // Reset form on success
      form.reset();
      setUploadedFiles([]);

      // Redirect to properties page
      router.push("/managers/properties");
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast.error(
        error?.data?.message || "Failed to create property. Please try again.",
        {
          className: "bg-red-500 text-white",
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Style for form field labels
  const labelStyle = "text-sm font-medium text-gray-200";

  // Style for form field inputs
  const inputStyle =
    "bg-[#0B1120] text-white border-[#1E2A45] focus:border-[#4F9CF9] focus:ring-[#4F9CF9] rounded-md";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1120] to-[#0F172A] text-white">
      <Toaster richColors position="top-center" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header with back button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white bg-[#0B1120]/80 hover:bg-[#1E2A45] rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Add New Property
              </h1>
              <p className="text-gray-400 mt-1">
                Create a new property listing with detailed information
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic Information */}
              <FormSection
                title="Basic Information"
                icon={<Building size={20} />}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <CreateFormField
                    name="name"
                    label="Property Name"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="Enter property name"
                  />

                  <CreateFormField
                    name="description"
                    label="Description"
                    type="textarea"
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} min-h-[100px] resize-y`}
                    placeholder="Describe your property..."
                  />

                  <CreateFormField
                    name="propertyType"
                    label="Property Type"
                    type="select"
                    options={Object.keys(PropertyTypeEnum).map((type) => ({
                      value: type,
                      label: type,
                    }))}
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} h-10`}
                  />
                </div>
              </FormSection>

              {/* Fees */}
              <FormSection
                title="Pricing & Fees"
                icon={<CircleDollarSign size={20} />}
              >
                <div className="space-y-6">
                  <div className="relative">
                    <CustomFormField
                      name="pricePerMonth"
                      label="Monthly Rent"
                      type="number"
                      labelClassName={labelStyle}
                      inputClassName={`${inputStyle} pl-7`}
                      min={0}
                    />
                    <span className="absolute top-9 left-3 text-gray-400">
                      R
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <CustomFormField
                        name="securityDeposit"
                        label="Security Deposit"
                        type="number"
                        labelClassName={labelStyle}
                        inputClassName={`${inputStyle} pl-7`}
                        min={0}
                      />
                      <span className="absolute top-9 left-3 text-gray-400">
                        R
                      </span>
                    </div>

                    <div className="relative">
                      <CustomFormField
                        name="applicationFee"
                        label="Application Fee"
                        type="number"
                        labelClassName={labelStyle}
                        inputClassName={`${inputStyle} pl-7`}
                        min={0}
                      />
                      <span className="absolute top-9 left-3 text-gray-400">
                        R
                      </span>
                    </div>
                  </div>
                </div>
              </FormSection>

              

              {/* Property Details */}
              <FormSection title="Property Details" icon={<Home size={20} />}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CreateFormField
                      name="beds"
                      label="Bedrooms"
                      type="number"
                      labelClassName={labelStyle}
                      inputClassName={inputStyle}
                      min={0}
                    />

                    <CreateFormField
                      name="baths"
                      label="Bathrooms"
                      type="number"
                      labelClassName={labelStyle}
                      inputClassName={inputStyle}
                      min={0}
                    />

                    <CreateFormField
                      name="squareFeet"
                      label="Square Feet"
                      type="number"
                      labelClassName={labelStyle}
                      inputClassName={inputStyle}
                      min={0}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <CreateFormField
                      name="isPetsAllowed"
                      label="Pets Allowed"
                      type="switch"
                      labelClassName={labelStyle}
                    />

                    <CreateFormField
                      name="isParkingIncluded"
                      label="Parking Included"
                      type="switch"
                      labelClassName={labelStyle}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Amenities and Highlights */}
              <FormSection
                title="Amenities & Highlights"
                icon={<Sparkles size={20} />}
              >
                <div className="space-y-6">
                  <div>
                    <CreateFormField
                      name="amenities"
                      label="Amenities"
                      type="multi-select"
                      options={Object.keys(AmenityEnum).map((amenity) => ({
                        value: amenity,
                        label: amenity,
                      }))}
                      labelClassName={labelStyle}
                      inputClassName={`${inputStyle} bg-[#0B1120] !text-white`}
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.watch("amenities")?.map((amenity, idx) => (
                        <Badge
                          key={idx}
                          className="bg-[#1E3A8A]/30 text-[#60A5FA] border-[#1E3A8A] px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <Coffee className="w-3 h-3" />
                          {amenity}
                          <button
                            type="button"
                            onClick={() => handleRemoveAmenity(amenity)}
                            className="ml-1 hover:bg-[#1E3A8A] rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <CreateFormField
                      name="highlights"
                      label="Highlights"
                      type="multi-select"
                      options={Object.keys(HighlightEnum).map((highlight) => ({
                        value: highlight,
                        label: highlight,
                      }))}
                      labelClassName={labelStyle}
                      inputClassName={`${inputStyle} bg-[#0B1120] !text-white`}
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.watch("highlights")?.map((highlight, idx) => (
                        <Badge
                          key={idx}
                          className="bg-[#5B21B6]/30 text-[#A78BFA] border-[#5B21B6] px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3" />
                          {highlight}
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(highlight)}
                            className="ml-1 hover:bg-[#5B21B6] rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </FormSection>

              {/* Photos */}
              <FormSection
                title="Property Photos"
                icon={<ImageDown size={20} />}
              >
                <div>
                  <CustomFormField
                    name="photoUrls"
                    label="Upload Photos"
                    type="file"
                    accept="image/*"
                    multiple
                    labelClassName={labelStyle}
                    inputClassName="hidden"
                    onChange={handleFileChange}
                    render={({ field }) => (
                      <div className="mt-2">
                        <label
                          htmlFor={field.name}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#1E2A45] rounded-lg cursor-pointer bg-[#0B1120]/50 hover:bg-[#0B1120] transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-[#4F9CF9]" />
                            <p className="mb-2 text-sm text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                          <input
                            id={field.name}
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              handleFileChange(e);
                            }}
                          />
                        </label>
                      </div>
                    )}
                  />

                  {/* File preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">
                        Selected files ({uploadedFiles.length}):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative bg-[#0B1120] rounded-md p-1 h-20 flex items-center justify-center overflow-hidden"
                          >
                            <Image
                              src={
                                URL.createObjectURL(file) || "/placeholder.svg"
                              }
                              alt={`Preview ${index}`}
                              width={300}
                              height={200}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormSection>

              {/* Location */}
              <FormSection
                title="Location Information"
                icon={<MapPin size={20} />}
              >
                <div className="space-y-4">
                  <CreateFormField
                    name="address"
                    label="Street Address"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="123 Main St, Apt 4B"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CreateFormField
                      name="city"
                      label="City"
                      className="w-full"
                      labelClassName={labelStyle}
                      inputClassName={inputStyle}
                      placeholder="Cape Town"
                    />

                    <CreateFormField
                      name="state"
                      label="State/Province"
                      className="w-full"
                      labelClassName={labelStyle}
                      inputClassName={inputStyle}
                      placeholder="Western Cape"
                    />

                    <CreateFormField
                      name="postalCode"
                      label="Postal Code"
                      className="w-full"
                      labelClassName={labelStyle}
                      inputClassName={inputStyle}
                      placeholder="8001"
                    />
                  </div>

                  <CreateFormField
                    name="country"
                    label="Country"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    placeholder="South Africa"
                  />
                </div>
              </FormSection>

              {/* Submit Button */}
              <div className="sticky bottom-4 w-full pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0070F3] to-[#4F9CF9] hover:from-[#0060D3] hover:to-[#3F8CE9] text-white font-medium py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Create Property
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NewProperty;
