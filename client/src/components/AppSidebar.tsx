import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import {
  Building,
  FileText,
  Heart,
  Home,
  Menu,
  Settings,
  X,
  ChevronRight,
} from "lucide-react";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

const AppSidebar = ({ userType }: AppSidebarProps) => {
  const pathname = usePathname();
  const { toggleSidebar, open, setOpen } = useSidebar();

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && open) {
        setOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, setOpen]);

  const navLinks =
    userType === "manager"
      ? [
          { icon: Building, label: "Properties", href: "/managers/properties" },
          {
            icon: FileText,
            label: "Applications",
            href: "/managers/applications",
          },
          { icon: Settings, label: "Settings", href: "/managers/settings" },
        ]
      : [
          { icon: Heart, label: "Favorites", href: "/tenants/favorites" },
          {
            icon: FileText,
            label: "Applications",
            href: "/tenants/applications",
          },
          { icon: Home, label: "Residences", href: "/tenants/residences" },
          { icon: Settings, label: "Settings", href: "/tenants/settings" },
        ];

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <Sidebar
      collapsible="icon"
      className="fixed left-0 bg-black/95 backdrop-blur-sm z-50 border-r border-white/5 shadow-2xl transition-all duration-300 ease-in-out transform-gpu"
      style={{
        top: `${NAVBAR_HEIGHT}px`,
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        width: open ? 'var(--sidebar-width)' : 'var(--sidebar-width-icon)',
        // On mobile, slide in from the left when open, otherwise hide off-screen
        transform: isMobile ? (open ? 'translateX(0)' : 'translateX(-100%)') : 'none',
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        
        {/* Gradient glow */}
        <div className="absolute -right-24 top-1/4 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-24 bottom-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl"></div>
        
        {/* Slice elements */}
        <div className="absolute top-1/3 -right-20 w-40 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rotate-45"></div>
        <div className="absolute bottom-1/3 -left-20 w-40 h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -rotate-45"></div>
      </div>

      <SidebarHeader className="relative z-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={cn(
                "flex min-h-[72px] w-full items-center pt-5 mb-3",
                open ? "justify-between px-5" : "justify-center"
              )}
            >
              {open ? (
                <>
                  <div className="flex items-center">
                    <div className="h-10 w-10 mr-3 rounded bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {userType === "manager" ? "M" : "T"}
                      </span>
                    </div>
                    <h1 className="text-base font-semibold text-white tracking-wide">
                      {userType === "manager" ? "MANAGER VIEW" : "TENANT VIEW"}
                    </h1>
                  </div>
                  <button
                    className="hover:bg-white/10 p-2 rounded-md transition-colors"
                    onClick={() => toggleSidebar()}
                    aria-label="Close sidebar"
                  >
                    <X className="h-5 w-5 text-gray-300" />
                  </button>
                </>
              ) : (
                <button
                  className="hover:bg-white/10 p-2 rounded-md transition-colors"
                  onClick={() => toggleSidebar()}
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5 text-gray-300" />
                </button>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="relative px-3 mt-6 z-10">
        {open && (
          <div className="mb-4 px-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Navigation
            </span>
          </div>
        )}
        
        <SidebarContent className="h-full">
          <SidebarMenu>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "flex items-center rounded-md px-4 py-3 my-2 transition-all duration-300 group overflow-hidden relative",
                      isActive
                        ? "bg-gradient-to-r from-blue-950/80 to-blue-900/50 text-white" 
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5",
                    )}
                  >
                    <Link href={link.href} className="w-full" scroll={false}>
                      <div className="flex items-center">
                        <link.icon
                          className={cn(
                            "h-5 w-5 transition-all duration-300",
                            isActive 
                              ? "text-blue-400" 
                              : "text-gray-500 group-hover:text-gray-300"
                          )}
                        />
                        
                        {open && (
                          <span
                            className={cn(
                              "ml-3 text-base font-medium transition-all duration-200",
                              isActive ? "text-gray-100" : "text-gray-400 group-hover:text-gray-300"
                            )}
                          >
                            {link.label}
                          </span>
                        )}
                        
                        {open && isActive && (
                          <ChevronRight className="h-4 w-4 ml-auto text-blue-400" />
                        )}
                        
                        {isActive && (
                          <>
                            {/* Active indicator */}
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]"></div>
                            
                            {/* Subtle glow effect */}
                            <div className="absolute -right-24 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                          </>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        
        {/* User section will be rendered at the end of the component */}
      </div>
      
      {/* User section at bottom - properly positioned */}
      {open && (
        <div className="absolute bottom-0 left-0 w-full px-2 mb-4">
          <div className="border-t border-white/5 pt-4 pb-2 relative">
            {/* Slice effect above user profile */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 backdrop-blur-md relative overflow-hidden">
              {/* Background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/50 to-purple-950/30 opacity-30"></div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-lg"></div>
              
              <div className="relative">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg border border-white/10 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {userType === "manager" ? "M" : "T"}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border border-black shadow-lg"></span>
              </div>
              
              <div className="flex flex-col relative">
                <span className="text-sm font-medium text-white">
                  {userType === "manager" ? "Property Manager" : "Tenant"}
                </span>
                <span className="text-xs text-gray-400">
                  {userType === "manager" ? "Admin Access" : "User Access"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

export default AppSidebar;