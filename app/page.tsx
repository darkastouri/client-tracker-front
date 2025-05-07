"use client";

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useTranslation } from "@/hooks/useTranslation"

export default function LandingPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-2xl">PayTrack</div>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button>{t("dashboard")}</Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-9 w-9 border hover:border-primary cursor-pointer">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user?.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t("Profile")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t("Settings")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("Logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline">{t("Sign In")}</Button>
                </Link>
                <Link href="/signup">
                  <Button>{t("Sign Up")}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("Simplify Client Payment Tracking")}</h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t("Easily manage your client payments with our intuitive tracking system. Stay organized and get paid on time.")}
            </p>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg">{t("Go to Dashboard")}</Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg">{t("Get Started for Free")}</Button>
              </Link>
            )}
          </div>
        </section>
        
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">{t("Key Features")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">{t("Payment Tracking")}</h3>
                <p className="text-muted-foreground">{t("Monitor all your client payments in one place with easy-to-read status indicators.")}</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">{t("Kanban View")}</h3>
                <p className="text-muted-foreground">{t("Visualize payment flows with our intuitive Kanban board for better payment management.")}</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">{t("Multilingual Support")}</h3>
                <p className="text-muted-foreground">{t("Our platform supports multiple languages including Arabic for global accessibility.")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">&copy; {new Date().getFullYear()} PayTrack. {t("All rights reserved.")}</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                {t("About")}
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                {t("Privacy")}
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                {t("Terms")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
