import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-64 flex-col bg-surface border-r border-border",
        className
      )}
      {...props}
    />
  )
)
Sidebar.displayName = "Sidebar"

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 border-b border-border", className)}
      {...props}
    />
  )
)
SidebarHeader.displayName = "SidebarHeader"

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 overflow-auto p-4", className)}
      {...props}
    />
  )
)
SidebarContent.displayName = "SidebarContent"

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4", className)}
      {...props}
    />
  )
)
SidebarFooter.displayName = "SidebarFooter"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    />
  )
)
SidebarNav.displayName = "SidebarNav"

interface SidebarNavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
}

const SidebarNavItem = React.forwardRef<HTMLAnchorElement, SidebarNavItemProps>(
  ({ className, active, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-blue-50 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    />
  )
)
SidebarNavItem.displayName = "SidebarNavItem"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
}
