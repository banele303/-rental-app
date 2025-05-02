"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api";
import { 
  CircleCheckBig, 
  Download, 
  Building, 
  Calendar, 
  Clock, 
  Filter, 
  User, 
  ChevronRight,
  X,
  Check,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

// Skeleton loader for applications
const ApplicationSkeleton = () => (
  <div className="w-full space-y-3">
    {[1, 2, 3].map((item) => (
      <Card key={item} className="p-4 bg-gray-900/50 border border-gray-800 overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-3/4 bg-gray-800" />
            <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-2/3 bg-gray-800" />
            <Skeleton className="h-4 w-1/2 bg-gray-800" />
          </div>
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-24 bg-gray-800 rounded-md" />
            <Skeleton className="h-9 w-24 bg-gray-800 rounded-md" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

// Component for application status badge
interface StatusBadgeProps {
  status: 'Approved' | 'Denied' | 'Pending';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    Approved: {
      color: "bg-green-500/20 text-green-400 border-green-500/50",
      icon: <Check className="w-3 h-3 mr-1" />
    },
    Denied: {
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      icon: <X className="w-3 h-3 mr-1" />
    },
    Pending: {
      color: "bg-amber-500/20 text-amber-400 border-amber-500/50",
      icon: <Clock className="w-3 h-3 mr-1" />
    }
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <Badge className={`px-2 py-1 ${config.color} flex items-center font-medium`}>
      {config.icon}
      {status}
    </Badge>
  );
};

// Main application card component
interface ApplicationItemProps {
  application: {
    id: number;
    status: 'Approved' | 'Denied' | 'Pending';
    applicationDate: string;
    user?: {
      firstName: string;
      lastName: string;
    };
    property: {
      id: number;
      name: string;
      unit?: string;
      monthlyRent: number;
      address: string;
    };
  };
  handleStatusChange: (id: number, status: 'Approved' | 'Denied' | 'Pending') => Promise<void>;
}

const ApplicationItem = ({ application, handleStatusChange }: ApplicationItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  // Format the application date
  const formattedDate = formatDistanceToNow(
    new Date(application.applicationDate),
    { addSuffix: true }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="overflow-hidden bg-gray-900/50 border border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-700">
        {/* Card Header - Always visible */}
        <div 
          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
          onClick={toggleExpand}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-300" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <h3 className="font-medium text-white">
                {application.user?.firstName} {application.user?.lastName}
              </h3>
              <div className="text-sm text-gray-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formattedDate}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={application.status} />
            <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`} />
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-gray-800 pt-4">
                {/* Property Information */}
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <h4 className="font-medium text-white">Property Details</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Name: </span>
                      <span className="text-white">{application.property.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Unit: </span>
                      <span className="text-white">{application.property.unit || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Monthly Rent: </span>
                      <span className="text-white">${application.property.monthlyRent}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Address: </span>
                      <span className="text-white">{application.property.address}</span>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CircleCheckBig className="w-4 h-4 text-gray-400" />
                    <h4 className="font-medium text-white">Application Details</h4>
                  </div>
                  <div className="text-sm">
                    <div className="mb-1">
                      <span className="text-gray-400">Application ID: </span>
                      <span className="text-white">{application.id}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-gray-400">Submitted: </span>
                      <span className="text-white">{new Date(application.applicationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-gray-400">Status: </span>
                      <StatusBadge status={application.status} />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4 justify-end">
                  <Link
                    href={`/managers/properties/${application.property.id}`}
                    className="bg-gray-800 border border-gray-700 text-gray-200 py-2 px-4 
                      rounded-md flex items-center justify-center hover:bg-gray-700 transition-colors text-sm"
                    scroll={false}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    View Property
                  </Link>
                  
                  {application.status === "Approved" && (
                    <Button
                      className="bg-gray-800 border border-gray-700 text-gray-200 py-2 px-4
                      rounded-md flex items-center justify-center hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  
                  {application.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button
                        className="px-4 py-2 text-sm text-white bg-green-700 rounded hover:bg-green-600 transition-colors"
                        onClick={() => handleStatusChange(application.id, "Approved")}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        className="px-4 py-2 text-sm text-white bg-red-700 rounded hover:bg-red-600 transition-colors"
                        onClick={() => handleStatusChange(application.id, "Denied")}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  )}
                  
                  {application.status === "Denied" && (
                    <Button
                      className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center
                      justify-center hover:bg-gray-700 transition-colors text-sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact User
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

// Applications Page Component
const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    {
      userId: authUser?.cognitoInfo?.userId,
      userType: "manager",
    },
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );
  
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  const handleStatusChange = async (id: number, status: 'Approved' | 'Denied' | 'Pending') => {
    try {
      await updateApplicationStatus({ id, status });
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  // Filter applications based on tab and search term
  const filteredApplications = applications?.filter((application) => {
    const matchesTab = activeTab === "all" || application.status.toLowerCase() === activeTab;
    
    if (!searchTerm) return matchesTab;
    
    const name = `${application.user?.firstName} ${application.user?.lastName}`.toLowerCase();
    const propertyName = application.property?.name.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return matchesTab && (name.includes(searchLower) || propertyName.includes(searchLower));
  }) || [];

  // Count applications by status
  const statusCounts = applications?.reduce((acc, app) => {
    const status = app.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-center sm:text-left">Applications</h1>
          <p className="text-gray-400 text-center sm:text-left">
            View and manage applications for your properties
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by applicant or property name..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="sm:flex-shrink-0">
            <Button 
              className="w-full sm:w-auto bg-gray-800 border border-gray-700 text-gray-200 py-2 px-4 
                rounded-md flex items-center justify-center hover:bg-gray-700 transition-colors"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Mobile-optimized Tabs */}
        <div className="mb-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex overflow-x-auto scrollbar-hide bg-gray-900/50 rounded-lg p-1 mb-6">
              <TabsTrigger 
                value="all" 
                className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md py-2 px-4"
              >
                All
                {applications && applications.length > 0 && (
                  <span className="ml-2 bg-gray-800 text-gray-200 px-2 py-0.5 rounded-full text-xs">
                    {applications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md py-2 px-4"
              >
                Pending
                {statusCounts.pending > 0 && (
                  <span className="ml-2 bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full text-xs">
                    {statusCounts.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md py-2 px-4"
              >
                Approved
                {statusCounts.approved > 0 && (
                  <span className="ml-2 bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full text-xs">
                    {statusCounts.approved}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="denied" 
                className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md py-2 px-4"
              >
                Denied
                {statusCounts.denied > 0 && (
                  <span className="ml-2 bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full text-xs">
                    {statusCounts.denied}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Application List */}
            {isLoading ? (
              <ApplicationSkeleton />
            ) : isError ? (
              <div className="text-center p-8 bg-red-900/20 border border-red-800 rounded-lg">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-red-300 mb-2">Error Loading Applications</h3>
                <p className="text-gray-300">There was an error fetching your applications. Please try again later.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <div className="text-center p-8 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <CircleCheckBig className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-300 mb-2">No Applications Found</h3>
                    <p className="text-gray-400">
                      {searchTerm 
                        ? "No applications match your search criteria." 
                        : activeTab !== "all" 
                          ? `You don't have any ${activeTab} applications.` 
                          : "You don't have any applications yet."}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredApplications.map((application) => (
                      <ApplicationItem
                        key={application.id}
                        application={application}
                        handleStatusChange={handleStatusChange}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Applications;