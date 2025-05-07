"use client"

import { cn } from "@/libs/utils"
import { useLayoutStore } from "@/store/useLayoutStore"
import { useTranslation } from "@/hooks/useTranslation"
import { useMobile } from "@/hooks/useMobile"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Box,
  ChevronRight,
  CreditCard,
  FileMinus,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Cog,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation()
  const { language } = useLayoutStore()
  const dir = language === "ar" ? "rtl" : "ltr"
  const pathname = usePathname()
  const isMobile = useMobile()
  const { sidebarOpen, toggleSidebar } = useLayoutStore()
  const { user, logout } = useAuth()

  // Group routes by category for better organization
  const mainRoutes = [
    {
      label: t("dashboard"),
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      active: pathname === "/dashboard",
      description: t("dashboardDescription"),
    },
  ]
  
  const businessRoutes = [
    {
      label: t("products"),
      icon: <Box className="h-5 w-5" />,
      href: "/dashboard/products",
      active: pathname === "/dashboard/products",
      description: t("productsDescription"),
    },
    {
      label: t("clients"),
      icon: <Users className="h-5 w-5" />,
      href: "/dashboard/clients",
      active: pathname.includes("/dashboard/clients"),
      description: t("clientsDescription"),
    },
    {
      label: t("orders"),
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/dashboard/orders",
      active: pathname === "/dashboard/orders",
      description: t("ordersDescription"),
    },
    {
      label: t("payments"),
      icon: <CreditCard className="h-5 w-5" />,
      href: "/dashboard/payments",
      active: pathname === "/dashboard/payments",
      description: t("paymentsDescription"),
    },
    {
      label: t("providers"),
      icon: <Truck className="h-5 w-5" />,
      href: "/dashboard/providers",
      active: pathname === "/dashboard/providers",
      description: t("providersDescription"),
    },
  ]
  
  const insightRoutes = [
    {
      label: t("finances"),
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/dashboard/finances",
      active: pathname === "/dashboard/finances",
      description: t("financesDescription"),
    },
    {
      label: t("analytics"),
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/dashboard/analytics",
      active: pathname === "/dashboard/analytics",
      description: t("analyticsDescription"),
    },
    {
      label: t("History"),
      icon: <History className="h-5 w-5" />,
      href: "/dashboard/history",
      active: pathname === "/dashboard/history",
      description: t("Track all activities and transactions"),
    },
  ]
  
  const accountRoutes = [
    {
      label: t("profile"),
      icon: <User className="h-5 w-5" />,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
      description: t("View and manage your profile information"),
    },
    {
      label: t("settings"),
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
      description: t("settingsDescription"),
    },
  ]

  const renderNavItems = (routes: any[]) => {
    return routes.map((route) => (
      <Button
        key={route.href}
        variant={route.active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-auto py-2.5 px-3", 
          route.active 
            ? "bg-primary text-primary-foreground font-medium" 
            : "hover:bg-muted",
          sidebarOpen ? "my-1" : "my-2 justify-center"
        )}
        asChild
      >
        <Link href={route.href} className="relative group">
          <div className="flex items-center">
            <span className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",  
              route.active ? "text-primary-foreground" : "text-muted-foreground"
            )}>
              {route.icon}
            </span>
            {sidebarOpen && (
              <div className="ml-3 flex flex-col justify-center">
                <div className="text-sm font-medium leading-none">{route.label}</div>
                {route.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{route.description}</div>
                )}
              </div>
            )}
          </div>
          {!route.active && (
            <span className={cn(
              "absolute inset-y-0 opacity-0 w-1 bg-primary rounded-full transition-all",
              dir === "rtl" ? "right-0" : "left-0",
              "group-hover:opacity-100"
            )} />
          )}
        </Link>
      </Button>
    ))
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn(
        "flex h-16 items-center border-b px-4", 
        sidebarOpen ? "justify-start" : "justify-center"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
            <Home className="h-5 w-5" />
          </div>
          {sidebarOpen && <span className="text-xl">ClientTrack</span>}
        </Link>
      </div>
      
      <ScrollArea className="flex-1 pt-5 pb-4 px-3">
        <div className="space-y-1 mb-4">
          {renderNavItems(mainRoutes)}
        </div>
        
        {sidebarOpen && (
          <div className="px-3 mb-2">
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("Business")}
            </h3>
          </div>
        )}
        <div className="space-y-1 mb-4">
          {renderNavItems(businessRoutes)}
        </div>
        
        {sidebarOpen && (
          <div className="px-3 mb-2">
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("Insights")}
            </h3>
          </div>
        )}
        <div className="space-y-1 mb-4">
          {renderNavItems(insightRoutes)}
        </div>
        
        {sidebarOpen && (
          <div className="px-3 mb-2">
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("Account")}
            </h3>
          </div>
        )}
        <div className="space-y-1">
          {renderNavItems(accountRoutes)}
        </div>
      </ScrollArea>
      
      {sidebarOpen && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name || t("User")}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email || ""}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar collapse button */}
      <div className="border-t p-3 flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => toggleSidebar()} 
          className="w-full flex items-center justify-center gap-2"
          title={sidebarOpen ? t("Collapse Sidebar") : t("Expand Sidebar")}
        >
          {sidebarOpen ? (
            <>
              <ChevronRight className={cn("h-4 w-4", dir === "rtl" && "rotate-180")} />
              <span className="text-xs">{t("Collapse")}</span>
            </>
          ) : (
            <ChevronRight className={cn("h-4 w-4 rotate-180", dir === "rtl" && "rotate-0")} />
          )}
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
        <SheetContent side={dir === "rtl" ? "right" : "left"} className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className={cn(
        "h-screen bg-card border-r transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-[70px]",
        dir === "rtl" ? "border-l border-r-0" : "border-r",
        className,
      )}
    >
      {sidebarContent}
    </div>
  )
}
