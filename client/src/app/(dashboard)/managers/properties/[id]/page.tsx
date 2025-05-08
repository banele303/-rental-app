"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetPaymentsQuery,
  useGetPropertyLeasesQuery,
  useGetPropertyQuery,
  useGetRoomsQuery,
} from "@/state/api";
import { 
  ArrowDownToLine, 
  ArrowLeft, 
  Check, 
  Download, 
  BedDouble, 
  Bath, 
  Ruler, 
  MapPin, 
  Plus,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PropertyDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const propertyId = Number(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'rooms'>('overview');

  const { data: property, isLoading: propertyLoading, error: propertyError } =
    useGetPropertyQuery(propertyId);
  const { data: leases, isLoading: leasesLoading } =
    useGetPropertyLeasesQuery(propertyId, { skip: !!propertyError });
  const { data: payments, isLoading: paymentsLoading } =
    useGetPaymentsQuery(propertyId, { skip: !!propertyError });
  const { data: rooms, isLoading: roomsLoading } =
    useGetRoomsQuery(propertyId, { skip: !!propertyError });

  // Show loading state while data is being fetched
  if (propertyLoading || leasesLoading || paymentsLoading || roomsLoading) return <Loading />;
  
  // Handle property not found error
  if (propertyError) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:ml-0">
        <Link
          href="/managers/properties"
          className="flex items-center mb-4 hover:text-primary-500"
          scroll={false}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Properties</span>
        </Link>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button
            onClick={() => router.push('/managers/properties')}
            className="bg-primary hover:bg-primary/90"
          >
            View All Properties
          </Button>
        </div>
      </div>
    );
  }

  const getCurrentMonthPaymentStatus = (leaseId: number) => {
    const currentDate = new Date();
    const currentMonthPayment = payments?.find(
      (payment) =>
        payment.leaseId === leaseId &&
        new Date(payment.dueDate).getMonth() === currentDate.getMonth() &&
        new Date(payment.dueDate).getFullYear() === currentDate.getFullYear()
    );
    return currentMonthPayment?.paymentStatus || "Not Paid";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Back to properties page */}
      <Link
        href="/managers/properties"
        className="flex items-center mb-4 hover:text-primary-500"
        scroll={false}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>Back to Properties</span>
      </Link>

      {/* Property Header with Image - Modernized */}
      <div className="relative w-full overflow-hidden mb-8 bg-gradient-to-br from-blue-950 to-black rounded-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 p-6 md:p-8">
          {/* Image container with fixed aspect ratio */}
          <div className="relative w-full md:w-2/5 aspect-[4/3] rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
            <Image
              src={property?.photoUrls?.[0] || "/placeholder.jpg"}
              alt={property?.name || "Property"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
          
          {/* Property details */}
          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{property?.name}</h1>
              <div className="flex items-center text-white/80 mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{property?.location?.address}, {property?.location?.city}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center justify-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <BedDouble className="h-5 w-5 text-blue-400 mb-1" />
                  <span className="font-medium text-white">{property?.beds || 0}</span>
                  <span className="text-xs text-gray-400">Beds</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <Bath className="h-5 w-5 text-blue-400 mb-1" />
                  <span className="font-medium text-white">{property?.baths || 0}</span>
                  <span className="text-xs text-gray-400">Baths</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <Ruler className="h-5 w-5 text-blue-400 mb-1" />
                  <span className="font-medium text-white">{property?.squareFeet || 0}</span>
                  <span className="text-xs text-gray-400">sq ft</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-white">R{property?.pricePerMonth?.toFixed(2)}<span className="text-sm font-normal text-gray-400">/month</span></div>
              <Button 
                onClick={() => router.push(`/managers/properties/${propertyId}/edit`)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                size="sm"
              >
                <Edit3 className="h-4 w-4 mr-2" /> Edit Property
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Modernized */}
      <div className="flex mb-8 overflow-x-auto no-scrollbar bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-1 border border-white/5 shadow-lg">
        <button
          className={`px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${activeTab === 'overview' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${activeTab === 'rooms' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          onClick={() => setActiveTab('rooms')}
        >
          Rooms
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${activeTab === 'tenants' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          onClick={() => setActiveTab('tenants')}
        >
          Tenants
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Details - Claude AI inspired modern gray design */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                <div className="h-5 w-1 bg-blue-500 rounded-full mr-3 shadow-glow-blue"></div>
                Property Details
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">{property?.description || "No description available."}</p>
              
              {/* We already have these stats in the header, so we can remove them here */}
              
              <div className="flex flex-wrap gap-2 mt-4">
                {property?.amenities?.map((amenity: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gray-800/50 text-gray-200 border-gray-600 hover:bg-gray-700/50 transition-colors">
                    {amenity}
                  </Badge>
                ))}
                {property?.isPetsAllowed && (
                  <Badge variant="outline" className="bg-gray-800/50 text-gray-200 border-gray-600 hover:bg-gray-700/50 transition-colors">Pets Allowed</Badge>
                )}
                {property?.isParkingIncluded && (
                  <Badge variant="outline" className="bg-gray-800/50 text-gray-200 border-gray-600 hover:bg-gray-700/50 transition-colors">Parking</Badge>
                )}
              </div>
            </div>
            
            {/* Additional Info Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                <div className="h-5 w-1 bg-purple-500 rounded-full mr-3 shadow-glow-purple"></div>
                Location Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Full Address</h3>
                    <p className="text-gray-400">{property?.location?.address}, {property?.location?.city}, {property?.location?.state} {property?.location?.zipCode}</p>
                  </div>
                </div>
                
                {/* You could add a map here if you have coordinates */}
                <div className="h-40 bg-gray-800/50 rounded-lg border border-gray-700/50 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Map view would appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card - Claude AI inspired modern gray design */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                <div className="h-5 w-1 bg-green-500 rounded-full mr-3 shadow-glow-green"></div>
                Pricing
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-300">Monthly Rent</span>
                  <span className="font-medium text-white">R{property?.pricePerMonth?.toFixed(2)}</span>
                </div>
                {property?.securityDeposit && (
                  <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300">Security Deposit</span>
                    <span className="font-medium text-white">R{property?.securityDeposit?.toFixed(2)}</span>
                  </div>
                )}
                {property?.applicationFee && (
                  <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300">Application Fee</span>
                    <span className="font-medium text-white">R{property?.applicationFee?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between p-4 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700/30 mt-4">
                  <span className="font-semibold text-white">Total Due at Signing</span>
                  <span className="font-bold text-white">R{((property?.pricePerMonth || 0) + (property?.securityDeposit || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                <div className="h-5 w-1 bg-blue-500 rounded-full mr-3 shadow-glow-blue"></div>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push(`/managers/properties/${propertyId}/edit`)} 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Edit3 className="h-4 w-4 mr-2" /> Edit Property Details
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" /> Download Property Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-blue-950 to-black rounded-xl p-6 md:p-8 space-y-6">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 z-0"></div>
          
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Available Rooms</h2>
                <p className="text-sm text-gray-400">Manage and view all rooms for this property.</p>
              </div>
              <Button 
                onClick={() => router.push(`/managers/properties/${propertyId}/edit`)}
                className="bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Room
              </Button>
            </div>

            {/* Room Cards with Modern Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms && rooms.length > 0 ? (
                rooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#333] bg-[#0F1112] rounded-xl">
                    <div className="relative aspect-video">
                      <Image
                        src={room.photoUrls?.[0] || "/placeholder.jpg"}
                        alt={room.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1112] via-transparent to-[#0F1112]/40 z-10" />
                      
                      {/* Price tag */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="bg-[#0F1112] backdrop-blur-md text-white px-3 py-1.5 rounded-md flex items-center shadow-lg border border-[#333]">
                          <span className="font-bold">R{room.pricePerMonth.toFixed(0)}</span>
                          <span className="text-xs text-white/80 ml-1">/mo</span>
                        </div>
                      </div>
                      
                      {/* Availability badge */}
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className={`${room.isAvailable 
                          ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                          : 'bg-red-900/50 text-red-300 border border-red-700/50'} 
                          backdrop-blur-sm px-2.5 py-1`}>
                          {room.isAvailable ? 'Available' : 'Occupied'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1 text-white">{room.name}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{room.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-[#111] border border-[#333]">
                          <BedDouble className="h-4 w-4 mb-1 text-gray-400" />
                          <span className="font-medium text-white">{room.capacity || 1}</span>
                          <span className="text-xs text-gray-400">Capacity</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-[#111] border border-[#333]">
                          <Ruler className="h-4 w-4 mb-1 text-gray-400" />
                          <span className="font-medium text-white">{room.squareFeet || '—'}</span>
                          <span className="text-xs text-gray-400">sq ft</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-[#333] mt-4">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full bg-[#111] border-[#333] hover:bg-[#222] text-white"
                          onClick={() => router.push(`/managers/properties/${propertyId}/edit`)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Room
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full bg-[#111] border border-[#333] rounded-xl p-8 text-center">
                  <p className="text-gray-400 mb-4">No rooms have been added to this property yet.</p>
                  <Button 
                    onClick={() => router.push(`/managers/properties/${propertyId}/edit`)}
                    className="bg-primary hover:bg-primary/90 text-white"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add First Room
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenants Tab */}
      {activeTab === 'tenants' && (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-blue-950 to-black rounded-xl p-6 md:p-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 z-0"></div>
          
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Tenants Overview</h2>
                <p className="text-sm text-gray-400">
                  Manage and view all tenants for this property.
                </p>
              </div>
              <div>
                <Button
                  variant="outline"
                  className="flex items-center bg-[#111] border-[#333] hover:bg-[#222] text-white"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span>Download All</span>
                </Button>
              </div>
            </div>
            <div className="bg-[#0F1112]/80 backdrop-blur-sm border border-[#333] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#333] hover:bg-[#111]">
                      <TableHead className="text-gray-300">Tenant</TableHead>
                      <TableHead className="text-gray-300">Lease Period</TableHead>
                      <TableHead className="text-gray-300">Monthly Rent</TableHead>
                      <TableHead className="text-gray-300">Current Month Status</TableHead>
                      <TableHead className="text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-300">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(leases ?? []).length > 0 ? (
                      (leases ?? []).map((lease) => (
                        <TableRow key={lease.id} className="border-b border-[#222] hover:bg-[#111]">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#222] border border-[#333]">
                                <Image
                                  src="/landing-i1.png"
                                  alt={lease.tenant.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-white">
                                  {lease.tenant.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {lease.tenant.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div>
                              {new Date(lease.startDate).toLocaleDateString()} -
                            </div>
                            <div>{new Date(lease.endDate).toLocaleDateString()}</div>
                          </TableCell>
                          <TableCell className="text-gray-300 font-medium">R{lease.rent.toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                getCurrentMonthPaymentStatus(lease.id) === "Paid"
                                  ? "bg-green-900/50 text-green-300 border border-green-700/50"
                                  : "bg-red-900/50 text-red-300 border border-red-700/50"
                              } backdrop-blur-sm`}
                            >
                              {getCurrentMonthPaymentStatus(lease.id) === "Paid" && (
                                <Check className="w-3.5 h-3.5 inline-block mr-1" />
                              )}
                              {getCurrentMonthPaymentStatus(lease.id)}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300">{lease.tenant.phoneNumber}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center bg-[#111] border-[#333] hover:bg-[#222] text-white"
                            >
                              <ArrowDownToLine className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                          <p>No tenants found for this property.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;