"use client"

import type React from "react"

import { useState } from "react"
import {
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Activity,
  FileText,
  Package,
  User,
  Edit,
  Check,
  X,
  Users,
} from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock user data
const userData = {
  id: "u123456",
  name: "Ahmed Mohammed",
  email: "ahmed.mohammed@example.com",
  role: "Administrator",
  phone: "+966 50 123 4567",
  company: "PayTrack Solutions",
  location: "Riyadh, Saudi Arabia",
  joinDate: "January 15, 2023",
  lastActive: "Today at 10:45 AM",
  avatar: "/placeholder.svg?height=128&width=128",
  bio: "Experienced financial manager with a focus on payment tracking and client management. Specializing in streamlining payment processes and improving client relationships.",
  stats: {
    clients: 48,
    products: 124,
    payments: 1240,
    revenue: "SAR 248,500",
  },
  recentActivity: [
    { id: 1, type: "payment", description: "Received payment from Client #1242", time: "2 hours ago" },
    { id: 2, type: "client", description: "Added new client: Saudi Tech Solutions", time: "Yesterday" },
    { id: 3, type: "product", description: "Updated inventory for Product #P-7842", time: "3 days ago" },
    { id: 4, type: "order", description: "Processed order #ORD-9954 for Client #1238", time: "1 week ago" },
  ],
}

export default function ProfilePage() {
  const { t, dir } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({ ...userData })

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing) {
      // Reset to original data if canceling
      setEditedUser({ ...userData })
    }
  }

  const handleSaveProfile = () => {
    // Here you would typically save the data to your backend
    // For now, we'll just toggle off editing mode
    setIsEditing(false)
    // In a real app, you would update userData here after successful API call
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("My Profile")}</h1>
        <p className="text-muted-foreground">{t("Manage your account settings and preferences")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{userData.role}</p>
              <Badge variant="outline" className="mb-6">
                {t("Active")}
              </Badge>
              <Button variant={isEditing ? "destructive" : "default"} className="w-full" onClick={handleEditToggle}>
                {isEditing ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    {t("Cancel")}
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("Edit Profile")}
                  </>
                )}
              </Button>
              {isEditing && (
                <Button variant="default" className="w-full mt-2" onClick={handleSaveProfile}>
                  <Check className="mr-2 h-4 w-4" />
                  {t("Save Changes")}
                </Button>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("Email")}</p>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("Phone")}</p>
                  <p className="text-sm text-muted-foreground">{userData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("Company")}</p>
                  <p className="text-sm text-muted-foreground">{userData.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("Location")}</p>
                  <p className="text-sm text-muted-foreground">{userData.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("Joined")}</p>
                  <p className="text-sm text-muted-foreground">{userData.joinDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-10 bg-transparent">
              <TabsTrigger
                value="overview"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {t("Overview")}
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {t("Activity")}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {t("Settings")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-6">
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Edit Profile Information")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("Full Name")}</Label>
                          <Input id="name" name="name" value={editedUser.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("Email")}</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={editedUser.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("Phone")}</Label>
                          <Input id="phone" name="phone" value={editedUser.phone} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">{t("Company")}</Label>
                          <Input id="company" name="company" value={editedUser.company} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">{t("Location")}</Label>
                        <Input id="location" name="location" value={editedUser.location} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">{t("Bio")}</Label>
                        <Textarea id="bio" name="bio" value={editedUser.bio} onChange={handleInputChange} rows={4} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Profile Information")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">{userData.bio}</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 mt-6 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t("Clients")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{userData.stats.clients}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t("Products")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{userData.stats.products}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t("Payments")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{userData.stats.payments}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t("Revenue")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{userData.stats.revenue}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Recent Activity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {userData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted bg-muted">
                            {activity.type === "payment" && <CreditCard className="h-5 w-5" />}
                            {activity.type === "client" && <User className="h-5 w-5" />}
                            {activity.type === "product" && <Package className="h-5 w-5" />}
                            {activity.type === "order" && <FileText className="h-5 w-5" />}
                          </div>
                          <div className="h-full w-px bg-border" />
                        </div>
                        <div className="pb-8">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Account Settings")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("Language")}</Label>
                    <select
                      id="language"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t("Timezone")}</Label>
                    <select
                      id="timezone"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="ast">Arabia Standard Time (AST)</option>
                      <option value="gmt">Greenwich Mean Time (GMT)</option>
                      <option value="est">Eastern Standard Time (EST)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t("Currency")}</Label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="sar">Saudi Riyal (SAR)</option>
                      <option value="usd">US Dollar (USD)</option>
                      <option value="eur">Euro (EUR)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
