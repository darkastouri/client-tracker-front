"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserCog, Lock, Globe, BellRing, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/hooks/useTranslation"
import { useToast } from "@/hooks/useToast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock user data
const user = {
  id: 1,
  name: "Ahmed Mahmoud",
  email: "ahmed.mahmoud@example.com",
  phone: "+216 55 123 456",
  avatar: "/placeholder.svg?height=100&width=100",
  role: "Admin",
  company: "Tech Solutions LLC",
  bio: "Business owner with 10 years of experience in retail electronics.",
  language: "en",
  timezone: "Africa/Tunis",
  dateFormat: "DD/MM/YYYY",
  currency: "TND",
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    bio: user.bio,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    language: user.language,
    timezone: user.timezone,
    dateFormat: user.dateFormat,
    currency: user.currency,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: t("Profile Updated"),
        description: t("Your profile information has been updated successfully."),
      })
    }, 1000)
  }

  const handlePasswordUpdate = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: t("Password Error"),
        description: t("New passwords don't match."),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
      toast({
        title: t("Password Updated"),
        description: t("Your password has been updated successfully."),
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("Settings")}</h2>
        <p className="text-muted-foreground">{t("Manage your account settings")}</p>
      </div>

      <div className="flex flex-col gap-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="profile">
              <UserCog className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("Profile")}</span>
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("Password")}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <BellRing className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("Notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Globe className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("Preferences")}</span>
            </TabsTrigger>
            <TabsTrigger value="help">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("Help")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle>{t("Profile Information")}</CardTitle>
                <CardDescription>{t("Update your personal information and company details")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2 text-center sm:text-left">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        {t("Change Avatar")}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">{t("Full Name")}</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="email">{t("Email")}</Label>
                      <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t("Phone Number")}</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="company">{t("Company")}</Label>
                      <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="bio">{t("Bio")}</Label>
                      <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">{t("Cancel")}</Button>
                <Button onClick={handleProfileUpdate} disabled={isLoading}>
                  {isLoading ? t("Saving...") : t("Save Changes")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle>{t("Password")}</CardTitle>
                <CardDescription>{t("Change your password")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="current-password">{t("Current Password")}</Label>
                    <Input
                      id="current-password"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">{t("New Password")}</Label>
                    <Input
                      id="new-password"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">{t("Confirm New Password")}</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">{t("Cancel")}</Button>
                <Button onClick={handlePasswordUpdate} disabled={isLoading}>
                  {isLoading ? t("Updating...") : t("Update Password")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle>{t("Notifications")}</CardTitle>
                <CardDescription>{t("Manage your notification preferences")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t("This feature will be available soon.")}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle>{t("Preferences")}</CardTitle>
                <CardDescription>{t("Manage your localization preferences")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="language">{t("Language")}</Label>
                    <Select
                      defaultValue={formData.language}
                      onValueChange={(value) => handleSelectChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select language")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">{t("Timezone")}</Label>
                    <Select
                      defaultValue={formData.timezone}
                      onValueChange={(value) => handleSelectChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select timezone")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Tunis">Africa/Tunis (GMT+1)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">{t("Date Format")}</Label>
                    <Select
                      defaultValue={formData.dateFormat}
                      onValueChange={(value) => handleSelectChange("dateFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select date format")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">{t("Currency")}</Label>
                    <Select
                      defaultValue={formData.currency}
                      onValueChange={(value) => handleSelectChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select currency")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TND">TND (dt)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">{t("Reset to Default")}</Button>
                <Button disabled={isLoading}>{isLoading ? t("Saving...") : t("Save Preferences")}</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle>{t("Help & Support")}</CardTitle>
                <CardDescription>{t("Get help with using the application")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">{t("User Guide")}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("Learn how to use the payment tracking system")}
                    </p>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      {t("View User Guide")}
                    </Button>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">{t("Contact Support")}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{t("Need help? Contact our support team")}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      {t("Contact Support")}
                    </Button>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">{t("FAQ")}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{t("Frequently asked questions")}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      {t("View FAQ")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
