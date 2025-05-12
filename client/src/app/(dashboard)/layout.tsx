"use client";

import Navbar from "@/components/Navbar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "@/components/AppSidebar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      if (
        (userRole === "manager" && pathname.startsWith("/tenants")) ||
        (userRole === "tenant" && pathname.startsWith("/managers"))
      ) {
        router.push(
          userRole === "manager"
            ? "/managers/properties"
            : "/tenants/favorites",
          { scroll: false }
        );
      } else {
        setIsLoading(false);
      }
    }
  }, [authUser, router, pathname]);

  if (authLoading || isLoading)
    return (
      <>
       
        <div className="fixed inset-0 bg-[#0F1112] z-[100] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-800/20 border-t-primary-800 animate-spin"></div>
        </div>
      </>
    );
  if (!authUser?.userRole) return null;

  return (
    <SidebarProvider>
      <DashboardContent userRole={authUser.userRole.toLowerCase() as "tenant" | "manager"}>
        {children}
      </DashboardContent>
    </SidebarProvider>
  );
};

// Separate component to use the sidebar context
const DashboardContent = ({ userRole, children }: { userRole: "tenant" | "manager", children: React.ReactNode }) => {
  const { open, setOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768 && open) {
        setOpen(false);
      }
    };
    
    // Check initially
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [open, setOpen]);
  
  return (
      <div className="min-h-screen w-full bg-[#1A1C1E]">
        <Navbar />
        <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
          <div className="flex relative">
            {/* Mobile overlay - only visible when sidebar is open on mobile */}
            {isMobile && open && (
              <div 
                className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" 
                onClick={() => setOpen(false)}
              />
            )}
            
            {/* Sidebar container */}
            <div className="sticky top-0 h-[calc(100vh-var(--navbar-height))] z-40">
              <Sidebar userType={userRole} />
            </div>
            
            {/* Main content that adjusts based on sidebar state */}
            <div 
              className="flex-grow transition-all duration-300 ease-in-out text-white p-3 sm:p-4 md:p-6 overflow-x-hidden"
              style={{
                '--navbar-height': `${NAVBAR_HEIGHT}px`,
                marginLeft: isMobile ? 0 : (open ? 'var(--sidebar-width)' : 'var(--sidebar-width-icon)'),
              } as React.CSSProperties}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardLayout;
