"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"

// Components
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { CreateFormField } from "@/components/CreateFormField"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Icons
import { Bed, Upload, X, Trash2, CircleDollarSign, SquareUser, Home } from "lucide-react"

// Room schema
export const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
  pricePerMonth: z.number().min(0, "Price must be a positive number"),
  securityDeposit: z.number().min(0, "Security deposit must be a positive number"),
  squareFeet: z.number().min(0, "Square feet must be a positive number").optional(),
  isAvailable: z.boolean().default(true),
  availableFrom: z.date().optional().nullable(),
  roomType: z.enum(["PRIVATE", "SHARED"]).default("PRIVATE"),
  capacity: z.number().min(1, "Capacity must be at least 1").default(1),
  amenities: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  photoUrls: z.any().optional(),
})

export type RoomFormData = z.infer<typeof roomSchema>

// Room amenities and features options
const roomAmenities = [
  "Air Conditioning",
  "Heating",
  "Ceiling Fan",
  "Private Bathroom",
  "Walk-in Closet",
  "Desk",
  "TV",
  "Internet",
  "Balcony",
  "Window",
]

const roomFeatures = ["Ensuite", "Corner Room", "Quiet", "Good View", "Spacious", "Bright", "Recently Renovated"]

interface RoomFormProps {
  onAddRoom: (room: RoomFormData) => void
  onCancel: () => void
}

export const RoomForm = ({ onAddRoom, onCancel }: RoomFormProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      description: "",
      pricePerMonth: 0,
      securityDeposit: 0,
      squareFeet: 0,
      isAvailable: true,
      roomType: "PRIVATE",
      capacity: 1,
      amenities: [],
      features: [],
    },
  })

  // Handle file selection to show preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const files = Array.from(e.target.files)
      setUploadedFiles(files)
    }
  }

  // Handle removing an amenity
  const handleRemoveAmenity = (amenityToRemove: string) => {
    const currentAmenities = form.getValues("amenities") || []
    const updatedAmenities = currentAmenities.filter((amenity) => amenity !== amenityToRemove)
    form.setValue("amenities", updatedAmenities)
  }

  // Handle removing a feature
  const handleRemoveFeature = (featureToRemove: string) => {
    const currentFeatures = form.getValues("features") || []
    const updatedFeatures = currentFeatures.filter((feature) => feature !== featureToRemove)
    form.setValue("features", updatedFeatures)
  }

  const handleAddRoom = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const data = form.getValues()
    const roomData = {
      ...data,
      photoUrls: uploadedFiles,
    }

    onAddRoom(roomData)
    form.reset()
    setUploadedFiles([])
  }

  // Style for form field labels
  const labelStyle = "text-sm font-medium text-gray-200"

  // Style for form field inputs
  const inputStyle = "bg-[#0B1120] text-white border-[#1E2A45] focus:border-[#4F9CF9] focus:ring-[#4F9CF9] rounded-md"

  return (
    <Card className="bg-[#0B1120]/90 border border-[#1E2A45] shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Bed className="h-5 w-5 text-[#4F9CF9]" />
          Add New Room
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            {/* Basic Room Information */}
            <div className="space-y-4">
              <CreateFormField
                name="name"
                label="Room Name"
                labelClassName={labelStyle}
                inputClassName={inputStyle}
                placeholder="Master Bedroom"
              />

              <CreateFormField
                name="description"
                label="Description"
                type="textarea"
                labelClassName={labelStyle}
                inputClassName={`${inputStyle} min-h-[80px] resize-y`}
                placeholder="Describe the room..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <CreateFormField
                    name="pricePerMonth"
                    label="Monthly Rent"
                    type="number"
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} pl-7`}
                    min={0}
                  />
                  <span className="absolute top-9 left-3 text-gray-400">R</span>
                </div>

                <div className="relative">
                  <CreateFormField
                    name="securityDeposit"
                    label="Security Deposit"
                    type="number"
                    labelClassName={labelStyle}
                    inputClassName={`${inputStyle} pl-7`}
                    min={0}
                  />
                  <span className="absolute top-9 left-3 text-gray-400">R</span>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CreateFormField
                  name="squareFeet"
                  label="Square Feet"
                  type="number"
                  labelClassName={labelStyle}
                  inputClassName={inputStyle}
                  min={0}
                />

                <CreateFormField
                  name="roomType"
                  label="Room Type"
                  type="select"
                  options={[
                    { value: "PRIVATE", label: "Private" },
                    { value: "SHARED", label: "Shared" },
                  ]}
                  labelClassName={labelStyle}
                  inputClassName={inputStyle}
                />

                <CreateFormField
                  name="capacity"
                  label="Capacity"
                  type="number"
                  labelClassName={labelStyle}
                  inputClassName={inputStyle}
                  min={1}
                />
              </div>

              <CreateFormField
                name="isAvailable"
                label="Available for Rent"
                type="switch"
                labelClassName={labelStyle}
              />

              <CreateFormField
                name="availableFrom"
                label="Available From"
                type="date"
                labelClassName={labelStyle}
                inputClassName={inputStyle}
              />
            </div>

            {/* Amenities and Features */}
            <div className="space-y-4">
              <div>
                <CreateFormField
                  name="amenities"
                  label="Amenities"
                  type="multi-select"
                  options={roomAmenities.map((amenity) => ({
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
                  name="features"
                  label="Features"
                  type="multi-select"
                  options={roomFeatures.map((feature) => ({
                    value: feature,
                    label: feature,
                  }))}
                  labelClassName={labelStyle}
                  inputClassName={`${inputStyle} bg-[#0B1120] !text-white`}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.watch("features")?.map((feature, idx) => (
                    <Badge
                      key={idx}
                      className="bg-[#5B21B6]/30 text-[#A78BFA] border-[#5B21B6] px-3 py-1.5 flex items-center gap-1.5"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feature)}
                        className="ml-1 hover:bg-[#5B21B6] rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Photos */}
            <div>
              <label className={labelStyle}>Room Photos</label>
              <div className="mt-2">
                <label
                  htmlFor="roomPhotos"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#1E2A45] rounded-lg cursor-pointer bg-[#0B1120]/50 hover:bg-[#0B1120] transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-[#4F9CF9]" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    id="roomPhotos"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* File preview */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Selected files ({uploadedFiles.length}):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="relative bg-[#0B1120] rounded-md p-1 h-20 flex items-center justify-center overflow-hidden"
                      >
                        <Image
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
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

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-[#1E2A45] text-gray-300 hover:bg-[#1E2A45]/50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddRoom}
                className="bg-gradient-to-r from-[#0070F3] to-[#4F9CF9] hover:from-[#0060D3] hover:to-[#3F8CE9] text-white"
              >
                Add Room
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

// Component to display a list of rooms
interface RoomListProps {
  rooms: RoomFormData[]
  onRemoveRoom: (index: number) => void
}

export const RoomList = ({ rooms, onRemoveRoom }: RoomListProps) => {
  if (rooms.length === 0) return null

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-medium text-white">Added Rooms ({rooms.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room, index) => (
          <Card key={index} className="bg-[#0B1120]/60 border border-[#1E2A45] hover:border-[#4F9CF9] transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-[#4F9CF9]" />
                  <h4 className="text-lg font-medium text-white">{room.name}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveRoom(index)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {room.description && (
                <p className="text-sm text-gray-400 mt-2">{room.description}</p>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">R{room.pricePerMonth}/month</span>
                </div>
                {room.squareFeet && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{room.squareFeet} sq ft</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <SquareUser className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Capacity: {room.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{room.roomType}</span>
                </div>
              </div>

              {/* Room Photos Preview */}
              {room.photoUrls && room.photoUrls.length > 0 && (
                <div className="mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(room.photoUrls as (File | string)[]).map((photo, photoIndex) => (
                      <div
                        key={photoIndex}
                        className="relative aspect-square bg-[#0B1120] rounded-md overflow-hidden border border-[#1E2A45]"
                      >
                        <Image
                          src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                          alt={`Room photo ${photoIndex + 1}`}
                          fill
                          className="object-cover"
                          unoptimized={typeof photo === 'string'}
                          onError={(e) => {
                            console.error('Error loading image:', e);
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.png'; // Fallback image
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities and Features */}
              {(room.amenities?.length > 0 || room.features?.length > 0) && (
                <div className="mt-3 space-y-2">
                  {room.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.map((amenity, idx) => (
                        <Badge
                          key={idx}
                          className="bg-[#1E3A8A]/30 text-[#60A5FA] border-[#1E3A8A] px-2 py-0.5 text-xs"
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {room.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.features.map((feature, idx) => (
                        <Badge
                          key={idx}
                          className="bg-[#5B21B6]/30 text-[#A78BFA] border-[#5B21B6] px-2 py-0.5 text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
