"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  Home, 
  Package, 
  Settings, 
  ShoppingCart, 
  Users, 
  Truck, 
  CreditCard, 
  LogOut,
  BellIcon,
  SearchIcon,
  MenuIcon,
  ChevronDownIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/useTranslation"
import { Sidebar } from "@/components/Sidebar"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLayoutStore } from "@/store/useLayoutStore"
import { Input } from "@/components/ui/input"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Providers",
    href: "/dashboard/providers",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()
  const { language } = useLayoutStore()
  const dir = language === "ar" ? "rtl" : "ltr"
  const { user, logout } = useAuth()

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Get page title from current path
  const getCurrentPageTitle = () => {
    const path = pathname.split('/').pop() || 'dashboard'
    return t(path.charAt(0).toUpperCase() + path.slice(1))
  }

  return (
    <div className={cn("flex min-h-screen bg-background", dir === "rtl" && "flex-row-reverse")}>
      <div className={cn(
        "fixed top-0 bottom-0 z-40 transition-all duration-300 lg:relative", 
        dir === "rtl" ? "right-0" : "left-0",
        isSidebarOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        <Sidebar />
      </div>
      
      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div className="hidden md:flex">
            <h1 className="text-xl font-semibold">{getCurrentPageTitle()}</h1>
          </div>
          
          <div className="relative flex-1 mx-4 max-w-md hidden md:flex">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input 
              type="search" 
              placeholder={t("Search") + "..."} 
              className="pl-10 bg-muted/40"
            />
          </div>
          
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
              <span className="sr-only">Notifications</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 rounded-full border h-9 p-1 pr-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Avatar className="h-7 w-7 border-2 border-primary/10">
                    <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt={user?.name || "User"} />
                    <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block font-medium text-sm">{user?.name || t("User")}</span>
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-3 border-b bg-muted/30">
                  <p className="text-sm font-bold">{user?.name || t("User")}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{user?.email || ""}</p>
                  {user?.role && (
                    <Badge variant="outline" className="mt-2 text-xs font-normal">
                      {user.role === 'admin' ? t("Administrator") : t("User")}
                    </Badge>
                  )}
                </div>
                <DropdownMenuItem asChild className="py-2 focus:bg-accent">
                  <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt={user?.name || "User"} />
                      <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    {t("My Profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-2 focus:bg-accent">
                  <Link href="/dashboard/settings" className="flex items-center cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    {t("Settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2 flex items-center justify-between">
                  <span className="text-sm">{t("Theme")}</span>
                  <ThemeSwitcher />
                </div>
                <div className="p-2 flex items-center justify-between">
                  <span className="text-sm">{t("Language")}</span>
                  <LanguageSwitcher />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer py-2 focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            {children}
          </div>
        </main>
        
        <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Client Tracker. {t("All rights reserved.")}</p>
        </footer>
      </div>
    </div>
  )
}
