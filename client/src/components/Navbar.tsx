"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import {
  Plus,
  Search,
  Settings,
  LayoutDashboard,
  LogOut,
  User,
  Circle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";

const Navbar = () => {
  const { data: authUser } = useGetAuthUserQuery(undefined);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const isDashboardPage =
    pathname.includes("/managers") || pathname.includes("/tenants");

  // Loading state management
  useEffect(() => {
    // Simulate loading state for initial render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Navigation state handling
  useEffect(() => {
    // For Next.js App Router, we need to handle route changes differently
    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    // Clean up loading state if component unmounts during navigation
    return () => {
      setIsLoading(false);
    };
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    window.location.href = "/";
  };

  // Helper function to get user's first letter for avatar
  const getUserInitial = () => {
    if (authUser?.userInfo?.name) {
      return authUser.userInfo.name[0].toUpperCase();
    }
    return authUser?.userRole?.[0].toUpperCase() || "U";
  };

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-800/20 border-t-primary-800 animate-spin"></div>
        </div>
      )}

      <div
        className="fixed top-0 left-0 w-full z-50"
        style={{ height: `${NAVBAR_HEIGHT}px` }}
      >
        <div className="flex justify-between items-center w-full py-4 px-8 bg-gradient-to-r from-primary-800 to-primary-700 backdrop-blur-lg bg-opacity-95">
          <div className="flex items-center gap-4 md:gap-6">
            {isDashboardPage && (
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
            )}
            <Link
              href="/"
              className="cursor-pointer group transition-all duration-300"
              scroll={false}
            >
              <div className="flex items-center gap-3">
                <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src="/student24-logo.png"
                    alt="Rentiful Logo"
                    width={178}
                    height={168}
                    className=""
                  />
                </div>
                {/* <div className="text-2xl font-bold text-white">
                  RENT
                  <span className="text-secondary-400 font-light group-hover:text-secondary-300 transition-colors duration-300">
                    IFUL
                  </span>
                </div> */}
              </div>
            </Link>
            {isDashboardPage && authUser && (
              <Button
                variant="secondary"
                className="md:ml-4 bg-white/10 backdrop-blur-lg text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() =>
                  router.push(
                    authUser.userRole?.toLowerCase() === "manager"
                      ? "/managers/newproperty"
                      : "/search"
                  )
                }
              >
                {authUser.userRole?.toLowerCase() === "manager" ? (
                  <>
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:block ml-2">
                      Add New Property
                    </span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span className="hidden md:block ml-2">
                      Search Properties
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
          {!isDashboardPage && (
            <p className="text-primary-100 hidden md:block font-light tracking-wide">
              Discover your perfect rental apartment with our advanced search
            </p>
          )}
          <div className="flex items-center gap-6">
            {authUser ? (
              <>
                {/* Settings link */}
                <Link
                  href={`/${authUser.userRole?.toLowerCase()}s/settings`}
                  className="group"
                  scroll={false}
                >
                  <Settings className="w-6 h-6 cursor-pointer text-primary-100 group-hover:text-white transition-colors duration-300" />
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="ring-2 ring-blue/20 hover:ring-white/40 bg-blue-900 transition-all duration-300 cursor-pointer">
                      <AvatarImage src={authUser.userInfo?.image} />
                      <AvatarFallback className="bg-blue-500 text-primary-800 font-bold">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-black shadow-xl rounded-xl border border-gray-800 mt-2 p-1 min-w-[220px] animate-in fade-in-50 zoom-in-95 duration-200"
                    align="end"
                    sideOffset={8}
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-800">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <p className="font-medium text-white">
                          {authUser.userInfo?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {authUser.userRole?.toLowerCase() === "manager" ? (
                          <div className="flex items-center gap-1.5">
                            <Circle className="h-4 w-4 text-green-400 fill-green-400" />
                            <span className="text-xs text-green-400">
                              Active LandLoard
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            <div className="flex items-center gap-1.5">
                            <Circle className="h-4 w-4 text-green-400 fill-green-400" />
                            <span className="text-xs text-green-400">
                              Active Student
                            </span>
                          </div>
                            {/* {authUser.userRole} */}
                          </span>
                        )}
                      </div>
                    </div>

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-blue-400 hover:!bg-gray-900 transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={() =>
                        router.push(
                          authUser.userRole?.toLowerCase() === "manager"
                            ? "/managers/properties"
                            : "/tenants/favorites",
                          { scroll: false }
                        )
                      }
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-blue-400 hover:!bg-gray-900 transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={() =>
                        router.push(
                          `/${authUser.userRole?.toLowerCase()}s/settings`,
                          { scroll: false }
                        )
                      }
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-800 my-1" />

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-red-400 hover:!bg-gray-900 hover:!text-red-300 transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button
                    variant="outline"
                    className="text-white border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40 transition-all duration-300 rounded-xl px-6"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="secondary"
                    className="text-primary-800 bg-white hover:bg-secondary-400 transition-all duration-300 rounded-xl px-6 shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
