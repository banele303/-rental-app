"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetApplicationsQuery, useGetAuthUserQuery } from "@/state/api";
import { CircleCheckBig, Clock, Download, FileText, Home, XCircle } from "lucide-react";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const userRole = authUser?.userRole || '';
  const userId = authUser?.cognitoInfo?.userId;
  
  // Skip the API call if the user is a manager trying to access tenant routes
  const shouldSkipQuery = userRole === 'manager';
  
  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery({
    userId: userId,
    userType: userRole,
  }, { skip: shouldSkipQuery });
  
  // Early return with a message for managers
  if (userRole === 'manager') {
    return (
      <div className="dashboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          title="Applications"
          subtitle="This page is only accessible to tenants"
        />
        <div className="flex flex-col items-center justify-center p-12 mt-8 bg-[#0F1112] border border-[#333] rounded-xl text-center">
          <FileText className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Access Restricted</h3>
          <p className="text-gray-400">As a property manager, you don&apos;t have access to the tenant applications page. Please use the manager dashboard to view applications for your properties.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-600/20 text-green-400 border border-green-500/20 hover:bg-green-600/30">Approved</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-600/20 text-yellow-300 border border-yellow-500/20 hover:bg-yellow-600/30">Pending</Badge>;
      case "Rejected":
        return <Badge className="bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400 border border-gray-500/20">Unknown</Badge>;
    }
  };

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header
        title="Applications"
        subtitle="Track and manage your property rental applications"
      />
      
      <div className="space-y-6 mt-8">
        {applications?.length > 0 ? (
          applications.map((application) => (
            <Card 
              key={application.id} 
              className="bg-[#0F1112] border border-[#333] shadow-md overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                <div className="relative md:w-1/4 h-40 md:h-auto overflow-hidden">
                  {application.property?.photoUrls?.[0] ? (
                    <Image 
                      src={application.property.photoUrls[0]}
                      alt={application.property.name}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <Home className="h-12 w-12 text-gray-600" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6 flex flex-col">
                  {/* Status Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-white">
                        {application.property?.name || "Unknown Property"}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Submitted: {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Property Details */}
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm">
                      {application.property?.location.address}, {application.property?.location.city}
                    </p>
                  </div>
                  
                  {/* Status Details */}
                  <div className="flex-1">
                    {application.status === "Approved" ? (
                      <div className="bg-green-900/20 p-4 rounded-md text-green-300 flex items-center border border-green-800/30">
                        <CircleCheckBig className="w-5 h-5 mr-2 flex-shrink-0" />
                        <p>
                          Your application has been approved! The property is being rented by you until{" "}
                          <span className="font-semibold">{new Date(application.lease?.endDate).toLocaleDateString()}</span>
                        </p>
                      </div>
                    ) : application.status === "Pending" ? (
                      <div className="bg-yellow-900/20 p-4 rounded-md text-yellow-300 flex items-center border border-yellow-800/30">
                        <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
                        <p>Your application is pending approval. We&apos;ll notify you once there&apos;s an update.</p>
                      </div>
                    ) : (
                      <div className="bg-red-900/20 p-4 rounded-md text-red-300 flex items-center border border-red-800/30">
                        <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <p>Your application has been denied. You can apply to other properties or contact support for more information.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <Link href={`/properties/${application.property?.id}`}>
                      <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        View Property
                      </Button>
                    </Link>
                    
                    {application.status === "Approved" && (
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download Agreement
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 mt-8 bg-[#0F1112] border border-[#333] rounded-xl text-center">
            <FileText className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Applications Found</h3>
            <p className="text-gray-400">You haven&apos;t submitted any rental applications yet. Browse properties and apply for ones you&apos;re interested in.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;