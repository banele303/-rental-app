"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Configuration constants
const SIDEBAR_CONFIG = {
  COOKIE_NAME: "sidebar_state",
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days
  WIDTH: "18rem",
  WIDTH_MOBILE: "18rem",
  WIDTH_ICON: "4rem",
  KEYBOARD_SHORTCUT: "b",
}

// Types
type SidebarState = "expanded" | "collapsed"

interface SidebarContextProps {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

// Context creation
const SidebarContext = React.createContext<SidebarContextProps>(null!)

// Custom hook
const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  
  return context
}

// Provider component
interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SidebarProvider: React.FC<SidebarProviderProps> = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // Internal state management
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp ?? internalOpen
  
  const setOpen = React.useCallback(
    (value: boolean | ((prevValue: boolean) => boolean)) => {
      const newOpenState = typeof value === "function" ? value(open) : value
      
      if (setOpenProp) {
        setOpenProp(newOpenState)
      } else {
        setInternalOpen(newOpenState)
      }

      document.cookie = `${SIDEBAR_CONFIG.COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_CONFIG.COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile 
      ? setOpenMobile(prev => !prev) 
      : setOpen(prev => !prev)
  }, [isMobile, setOpen, setOpenMobile])

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_CONFIG.KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{
            "--sidebar-width": SIDEBAR_CONFIG.WIDTH,
            "--sidebar-width-icon": SIDEBAR_CONFIG.WIDTH_ICON,
            ...style,
          } as React.CSSProperties}
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full bg-white dark:bg-slate-900",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// Main sidebar component
interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

const Sidebar: React.FC<SidebarProps> = ({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md transition-all duration-300 backdrop-blur-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          side={side}
          className="w-(--sidebar-width) bg-white dark:bg-slate-900 p-0 text-slate-800 dark:text-slate-100 shadow-lg [&>button]:hidden"
          style={{
            "--sidebar-width": SIDEBAR_CONFIG.WIDTH_MOBILE,
          } as React.CSSProperties}
        >
          <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-800">
            <SheetTitle className="text-slate-900 dark:text-white font-medium">Navigation</SheetTitle>
            <SheetDescription className="text-slate-500 dark:text-slate-400">Access your dashboard sections.</SheetDescription>
          </SheetHeader>
          <div className="p-4">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      data-slot="sidebar"
      className="md:flex hidden"
    >
      {/* Sidebar gap handler */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-300 ease-in-out",
          variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"  
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-all duration-300 ease-in-out md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" 
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
        )}
      >
        <div
          data-slot="sidebar"
          className={cn(
            "flex h-full w-(--sidebar-width) flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-md transition-all duration-300 backdrop-blur-lg",
            "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

// Trigger button
const SidebarTrigger: React.FC<React.ComponentProps<"button">> = ({
  className,
  onClick,
  ...props
}) => {
  const { toggleSidebar } = useSidebar()
  
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={(e) => {
        toggleSidebar()
        onClick?.(e)
      }}
      className={cn("text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200", className)}
      aria-label="Toggle sidebar"
      {...props}
    >
      <PanelLeftIcon className="size-5" />
    </Button>
  )
}

// Rail component for resizing
const SidebarRail: React.FC<React.ComponentProps<"button">> = ({ className, ...props }) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-in-out after:absolute after:inset-y-0 after:left-1/2 after:w-[1px] after:bg-slate-200 dark:after:bg-slate-700 after:transition-opacity hover:after:bg-slate-300 dark:hover:after:bg-slate-600 hover:after:opacity-100 sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-slate-100 dark:hover:group-data-[collapsible=offcanvas]:bg-slate-800/30",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

// Main content area
const SidebarInset: React.FC<React.ComponentProps<"main">> = ({ className, ...props }) => {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-slate-950",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-lg md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

// Input field
const SidebarInput: React.FC<React.ComponentProps<typeof Input>> = ({ className, ...props }) => {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn(
        "h-9 w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-none ring-1 ring-slate-200 dark:ring-slate-700 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600",
        className
      )}
      {...props}
    />
  )
}

// Header component
const SidebarHeader: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <section
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("flex flex-col py-2 px-3", className)}
      {...props}
    />
  )
}

// Footer component
const SidebarFooter: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-3 p-3 border-t border-slate-200 dark:border-slate-800", className)}
      {...props}
    />
  )
}

// Separator component
const SidebarSeparator: React.FC<React.ComponentProps<typeof Separator>> = ({ className, ...props }) => {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("my-4 bg-slate-200 dark:bg-slate-800", className)}
      {...props}
    />
  )
}

// Content area
const SidebarContent: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <section
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex-1 overflow-auto overscroll-contain py-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-slate-800 [&::-webkit-scrollbar]:w-1.5",
        className
      )}
      {...props}
    />
  )
}

// Group component
const SidebarGroup: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

// Group label component
interface SidebarGroupLabelProps extends React.ComponentProps<"div"> {
  asChild?: boolean
}

const SidebarGroupLabel: React.FC<SidebarGroupLabelProps> = ({
  className,
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : "h3"
  
  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "mb-2 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-data-[collapsible=icon]:sr-only",
        className
      )}
      {...props}
    />
  )
}

// Group action component
interface SidebarGroupActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

const SidebarGroupAction: React.FC<SidebarGroupActionProps> = ({
  className,
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-6 items-center justify-center rounded-md bg-slate-200 dark:bg-slate-700 p-0 text-slate-500 dark:text-slate-400 outline-none ring-slate-200 dark:ring-slate-700 transition-all hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden", // Larger hit area on mobile
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

// Group content
const SidebarGroupContent: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

// Menu component
const SidebarMenu: React.FC<React.ComponentProps<"ul">> = ({ className, ...props }) => {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

// Menu item component
const SidebarMenuItem: React.FC<React.ComponentProps<"li">> = ({ className, ...props }) => {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

// Menu button variants
const sidebarMenuButtonVariants = cva(
  [
    "peer/menu-button group/menu-button relative flex w-full min-w-0 select-none items-center gap-2 overflow-hidden rounded-md px-3 outline-none ring-1 ring-transparent transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white active:bg-slate-200 dark:active:bg-slate-800 active:text-slate-900 dark:active:text-white focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-950/30 data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300 data-[active=true]:[&>svg]:text-blue-600 dark:data-[active=true]:[&>svg]:text-blue-400",
        outline:
          "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white active:bg-slate-100 dark:active:bg-slate-800 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 data-[active=true]:border-blue-200 dark:data-[active=true]:border-blue-900 data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-950/30 data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300 data-[active=true]:[&>svg]:text-blue-600 dark:data-[active=true]:[&>svg]:text-blue-400",
        ghost:
          "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white active:bg-slate-200 dark:active:bg-slate-800 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-950/30 data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300 data-[active=true]:[&>svg]:text-blue-600 dark:data-[active=true]:[&>svg]:text-blue-400",
      },
      size: {
        default: "h-10",
        sm: "h-8 text-xs",
        lg: "h-12 group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Menu button component
interface SidebarMenuButtonProps extends 
  React.ComponentProps<"button">,
  VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
}

const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) => {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  const tooltipProps = typeof tooltip === "string" 
    ? { children: tooltip } 
    : tooltip

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        className="bg-zinc-900 text-zinc-100 border-zinc-800"
        {...tooltipProps}
      />
    </Tooltip>
  )
}

// Menu action component
interface SidebarMenuActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  showOnHover?: boolean
}

const SidebarMenuAction: React.FC<SidebarMenuActionProps> = ({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-6 items-center justify-center rounded-md bg-zinc-800/50 p-0 text-zinc-400 outline-none ring-zinc-700 transition-all hover:bg-zinc-800 hover:text-zinc-100 peer-hover/menu-button:text-zinc-200 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden", // Larger hit area on mobile
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-zinc-100 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

// Menu badge component
const SidebarMenuBadge: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "absolute right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-800 px-1.5 text-xs font-medium tabular-nums text-zinc-200 peer-hover/menu-button:bg-zinc-700 peer-hover/menu-button:text-zinc-100 peer-data-[active=true]/menu-button:bg-zinc-700 peer-data-[active=true]/menu-button:text-zinc-100 select-none",
        "peer-data-[size=sm]/menu-button:top-1.5",
        "peer-data-[size=default]/menu-button:top-2",
        "peer-data-[size=lg]/menu-button:top-3.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

// Menu skeleton component
interface SidebarMenuSkeletonProps extends React.ComponentProps<"div"> {
  showIcon?: boolean
}

const SidebarMenuSkeleton: React.FC<SidebarMenuSkeletonProps> = ({
  className,
  showIcon = false,
  ...props
}) => {
  // Deterministic width calculation
  const id = React.useId()
  const width = React.useMemo(() => {
    const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return `${(hash % 40) + 50}%`
  }, [id])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-10 items-center gap-3 rounded-md px-3", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-5 rounded-md bg-slate-200 dark:bg-slate-700/80 animate-pulse"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 bg-slate-200 dark:bg-slate-700/80 animate-pulse"
        data-sidebar="menu-skeleton-text"
        style={{
          maxWidth: width,
        }}
      />
    </div>
  )
}

// Submenu components
const SidebarMenuSub: React.FC<React.ComponentProps<"ul">> = ({ className, ...props }) => {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-slate-200 dark:border-slate-700 px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

const SidebarMenuSubItem: React.FC<React.ComponentProps<"li">> = ({ className, ...props }) => {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

// Submenu button component
interface SidebarMenuSubButtonProps extends React.ComponentProps<"a"> {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}

const SidebarMenuSubButton: React.FC<SidebarMenuSubButtonProps> = ({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-slate-600 dark:text-slate-400 outline-none ring-slate-300 dark:ring-slate-700 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 active:bg-slate-200 dark:active:bg-slate-800/60 active:text-slate-900 dark:active:text-slate-100 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-slate-500 dark:[&>svg]:text-slate-500",
        "data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-950/20 data-[active=true]:font-medium data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300 data-[active=true]:[&>svg]:text-blue-600 dark:data-[active=true]:[&>svg]:text-blue-400",
        size === "sm" && "h-6 text-xs",
        size === "md" && "h-7 text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

// Export all components
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}