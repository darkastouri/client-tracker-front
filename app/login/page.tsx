"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { LayoutDashboard, LockIcon, MailIcon, ArrowRightIcon } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (!result.success) {
        toast({
          title: t("Login Failed"),
          description: result.message || t("Invalid email or password"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("An unexpected error occurred. Please try again."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full flex flex-col items-center justify-center max-w-6xl mx-auto">
        <div className="w-full grid md:grid-cols-2 gap-8 items-center">
          {/* Brand Section */}
          <div className="hidden md:flex flex-col space-y-6 p-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold">ClientTrack</h1>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold">{t("Welcome to Your Client Tracking Solution")}</h2>
              <p className="text-muted-foreground max-w-md">
                {t("Manage your clients, track payments, and grow your business with our comprehensive platform")}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-card border">
                <div className="text-2xl font-bold text-primary">98%</div>
                <p className="text-sm text-muted-foreground">{t("Improved collection rate")}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <div className="text-2xl font-bold text-primary">2x</div>
                <p className="text-sm text-muted-foreground">{t("Faster payment processing")}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground">{t("Access to your data")}</p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <div className="text-2xl font-bold text-primary">100+</div>
                <p className="text-sm text-muted-foreground">{t("Business insights")}</p>
              </div>
            </div>
          </div>
          
          {/* Form Section */}
          <Card className="w-full max-w-md mx-auto shadow-lg border-muted/30">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 mb-2 md:hidden">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="font-bold">ClientTrack</h3>
              </div>
              <CardTitle className="text-2xl font-bold">{t("Sign in")}</CardTitle>
              <CardDescription>
                {t("Enter your credentials to access your account")}
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("Email")}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MailIcon className="h-5 w-5 text-muted-foreground/70" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      {t("Password")}
                    </Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      {t("Forgot password?")}
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockIcon className="h-5 w-5 text-muted-foreground/70" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("Remember me")}
                  </label>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary-foreground rounded-full" />
                      {t("Signing in...")}
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      {t("Sign in")}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  {t("Don't have an account?")}{" "}
                  <Link href="/signup" className="text-primary font-medium hover:underline">
                    {t("Sign up")}
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} ClientTrack. {t("All rights reserved.")}
          </p>
        </div>
      </div>
    </div>
  )
}
