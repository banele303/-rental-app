"use client"

import { NAVBAR_HEIGHT } from "@/lib/constants"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useGetAuthUserQuery } from "@/state/api"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "aws-amplify/auth"
import {
  Plus,
  Search,
  Settings,
  LayoutDashboard,
  LogOut,
  User,
  Circle,
  ChevronDown,
  LogIn,
  UserPlus,
  Home,
  Building2,
  FileText,
  Loader2,
  BookOpen
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"

const Navbar = () => {
  const { data: authUser } = useGetAuthUserQuery(undefined)
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  const isDashboardPage = pathname.includes("/managers") || pathname.includes("/tenants")

  // Loading state management
  useEffect(() => {
    // Simulate loading state for initial render
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // For Next.js App Router, we need to handle route changes differently
  const handleRouteChangeComplete = () => {
    setIsLoading(false)
  }

  // Navigation state handling
  useEffect(() => {
    // Clean up loading state if component unmounts during navigation
    return () => {
      setIsLoading(false)
    }
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
    window.location.href = "/"
  }

  // Helper function to get user's first letter for avatar
  const getUserInitial = () => {
    if (authUser?.userInfo?.name) {
      // Just return the first letter capitalized
      return authUser.userInfo.name[0].toUpperCase();
    }
    return authUser?.userRole?.[0].toUpperCase() || "U";
  }

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-blue-600 font-medium animate-pulse">Loading...</p>
        </div>
      )}

      <header className="fixed top-0 left-0 w-full z-50">
        <div className="flex justify-between items-center w-full py-4 px-6 md:px-8 bg-white shadow-md dark:bg-slate-900 backdrop-blur-lg" style={{ height: `${NAVBAR_HEIGHT}px` }}>
          {/* Left section: Logo and dashboard actions */}
          <div className="flex items-center gap-4 md:gap-6">
            {isDashboardPage && (
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
            )}
            <div className="group transition-all duration-300">
              <div className="relative transform transition-transform duration-300">
                <Link href="/" >
                  <Image
                    src="/student24-logo.png"
                    alt="Rentiful Logo"
                    width={160}
                    height={53}
                    className="object-contain h-14 cursor-pointer"
                    priority
                    draggable={false}
                  />
                </Link>
              </div>
            </div>
            
            {/* Add property button moved to left side */}
            {isDashboardPage && authUser && authUser.userRole?.toLowerCase() === "manager" && (
              <Button
                variant="default"
                className="ml-4 md:ml-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-sm"
                onClick={() => router.push("/managers/newproperty")}
              >
                <Building2 className="h-4 w-4" />
                <span className="ml-2">Add Property</span>
              </Button>
            )}
          </div>

          {/* Middle section with action buttons aligned with sidebar */}
          <div className="flex items-center justify-center">
            {isDashboardPage && authUser && authUser.userRole?.toLowerCase() === "tenant" && (
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-sm"
                onClick={() => router.push("/search")}
              >
                <Search className="h-4 w-4" />
                <span className="ml-2">Search Properties</span>
              </Button>
            )}
          </div>

          {/* Middle section: Tagline (only on non-dashboard pages) */}
          {!isDashboardPage && (
            <div className="absolute left-1/2 transform -translate-x-1/2 w-full flex justify-center">
              <p className="text-slate-600 dark:text-slate-300 hidden md:block font-light tracking-wide text-center">
                Discover your perfect rental apartment with our advanced search
              </p>
            </div>
          )}

          {/* Right section: User actions */}
          <div className="flex items-center gap-6">
            {authUser ? (
              <>
                {/* Settings link */}
                <Link href={`/${authUser.userRole?.toLowerCase()}s/settings`} className="group" scroll={false}>
                  <Settings className="w-6 h-6 cursor-pointer text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-blue-50 transition-all duration-300">
                      <Avatar className="h-9 w-9 ring-2 ring-blue-500/30 hover:ring-blue-500/50 bg-blue-100 transition-all duration-300 cursor-pointer shadow-sm">
                        {/* <AvatarImage src={authUser.userInfo?.image || "/placeholder.svg"} /> */}
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center">
                          {authUser.userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 mt-2 p-1 min-w-[240px] animate-in fade-in-50 zoom-in-95 duration-200"
                    align="end"
                    sideOffset={8}
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <p className="font-medium text-slate-900 dark:text-white">{authUser.userInfo?.name}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {authUser.userRole?.toLowerCase() === "manager" ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Active Landlord</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Active Student</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={() =>
                        router.push(
                          authUser.userRole?.toLowerCase() === "manager"
                            ? "/managers/properties"
                            : "/tenants/favorites",
                          { scroll: false },
                        )
                      }
                    >
                      <Home className="w-4 h-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={() => router.push('/blog', { scroll: false })}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Blog</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={() => router.push(`/${authUser.userRole?.toLowerCase()}s/settings`, { scroll: false })}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800 my-1" />

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 flex items-center gap-2 text-sm"
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-300 rounded-full h-10 w-10"
                    >
                      <User className="h-5 w-5 text-slate-700" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 mt-2 p-1 min-w-[200px] animate-in fade-in-50 zoom-in-95 duration-200"
                    align="end"
                    sideOffset={8}
                  >
                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={() => router.push('/blog', { scroll: false })}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Blog</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={() => router.push("/signin")}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800 my-1" />

                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 px-3 my-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center gap-2 text-sm"
                      onClick={() => router.push("/signup")}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar
