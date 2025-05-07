"use client"

import type React from "react"

import { useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash2, Phone, Mail, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/hooks/useTranslation"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"

// Mock data for providers
const providers = [
  {
    id: 1,
    name: "Global Electronics Ltd",
    email: "contact@globalelectronics.com",
    phone: "+1 234 567 890",
    totalSpent: 25000,
    lastOrder: "2024-02-15",
    productsSupplied: 15,
    status: "active",
    paymentTerms: "Net 30",
    address: "123 Supply Chain Ave, Business District",
  },
  {
    id: 2,
    name: "Tech Components Inc",
    email: "orders@techcomponents.com",
    phone: "+1 234 567 891",
    totalSpent: 18500,
    lastOrder: "2024-02-10",
    productsSupplied: 8,
    status: "active",
    paymentTerms: "Net 45",
    address: "456 Industrial Park Rd, Tech Zone",
  },
  {
    id: 3,
    name: "Quality Goods Co",
    email: "procurement@qualitygoods.com",
    phone: "+1 234 567 892",
    totalSpent: 12000,
    lastOrder: "2024-01-28",
    productsSupplied: 12,
    status: "inactive",
    paymentTerms: "Net 15",
    address: "789 Wholesale Street, Commerce City",
  },
]

export default function ProvidersPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false)
  const [isEditProviderOpen, setIsEditProviderOpen] = useState(false)
  const [isDeleteProviderOpen, setIsDeleteProviderOpen] = useState(false)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [newProvider, setNewProvider] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "",
  })

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProvider((prev) => ({ ...prev, [name]: value }))
  }

  const { toast } = useToast()

  const handleAddProvider = () => {
    // In a real app, you would call your API here
    toast({
      title: t("Provider Added"),
      description: t("The provider has been added successfully."),
    })
    setIsAddProviderOpen(false)
    setNewProvider({
      name: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "",
    })
  }

  const handleEditProvider = () => {
    toast({
      title: t("Provider Updated"),
      description: t("The provider has been updated successfully."),
    })
    setIsEditProviderOpen(false)
  }

  const handleDeleteProvider = () => {
    toast({
      title: t("Provider Deleted"),
      description: t("The provider has been deleted successfully."),
    })
    setIsDeleteProviderOpen(false)
  }

  const handlePlaceOrder = () => {
    toast({
      title: t("Order Placed"),
      description: t("Your order has been placed successfully."),
    })
    setIsOrderDialogOpen(false)
  }

  const handleContact = () => {
    toast({
      title: t("Message Sent"),
      description: t("Your message has been sent to the provider."),
    })
    setIsContactDialogOpen(false)
  }

  const openEditDialog = (provider: any) => {
    setSelectedProvider(provider)
    setNewProvider({
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      address: provider.address,
      paymentTerms: provider.paymentTerms,
    })
    setIsEditProviderOpen(true)
  }

  const openDeleteDialog = (provider: any) => {
    setSelectedProvider(provider)
    setIsDeleteProviderOpen(true)
  }

  const openOrderDialog = (provider: any) => {
    setSelectedProvider(provider)
    setIsOrderDialogOpen(true)
  }

  const openContactDialog = (provider: any) => {
    setSelectedProvider(provider)
    setIsContactDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Providers")}</h2>
          <p className="text-muted-foreground">{t("Manage your supply chain relationships")}</p>
        </div>
        <Dialog open={isAddProviderOpen} onOpenChange={setIsAddProviderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("Add Provider")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("Add New Provider")}</DialogTitle>
              <DialogDescription>
                {t("Enter the provider's information. Click save when you're done.")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("Company Name")}</Label>
                <Input
                  id="name"
                  name="name"
                  value={newProvider.name}
                  onChange={handleInputChange}
                  placeholder={t("Provider company name")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newProvider.email}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("Phone")}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newProvider.phone}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">{t("Address")}</Label>
                <Input
                  id="address"
                  name="address"
                  value={newProvider.address}
                  onChange={handleInputChange}
                  placeholder="123 Business St, City"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paymentTerms">{t("Payment Terms")}</Label>
                <Input
                  id="paymentTerms"
                  name="paymentTerms"
                  value={newProvider.paymentTerms}
                  onChange={handleInputChange}
                  placeholder="Net 30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddProviderOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddProvider}>{t("Save Provider")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("Search providers...")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="bg-card dark:bg-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{provider.name}</CardTitle>
                  <CardDescription>{provider.email}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t("Open menu")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openEditDialog(provider)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("Edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openOrderDialog(provider)}>{t("Place Order")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openContactDialog(provider)}>{t("Contact")}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openDeleteDialog(provider)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("Delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("Status")}</span>
                  <Badge variant={provider.status === "active" ? "default" : "secondary"}>{t(provider.status)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("Products Supplied")}</span>
                  <span className="text-sm font-medium">{provider.productsSupplied}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("Total Spent")}</span>
                  <span className="text-sm font-medium">dt {provider.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("Last Order")}</span>
                  <span className="text-sm">{new Date(provider.lastOrder).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("Payment Terms")}</span>
                  <span className="text-sm">{provider.paymentTerms}</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">{t("Address")}</span>
                  <p className="text-sm mt-1">{provider.address}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="w-full" size="sm" onClick={() => openOrderDialog(provider)}>
                {t("Place Order")}
              </Button>
              <Button className="w-full" size="sm" onClick={() => openContactDialog(provider)}>
                {t("Contact")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Provider Dialog */}
      <Dialog open={isEditProviderOpen} onOpenChange={setIsEditProviderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("Edit Provider")}</DialogTitle>
            <DialogDescription>
              {t("Update the provider's information. Click save when you're done.")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t("Company Name")}</Label>
              <Input
                id="edit-name"
                name="name"
                value={newProvider.name}
                onChange={handleInputChange}
                placeholder={t("Provider company name")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">{t("Email")}</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={newProvider.email}
                onChange={handleInputChange}
                placeholder="contact@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">{t("Phone")}</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={newProvider.phone}
                onChange={handleInputChange}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">{t("Address")}</Label>
              <Input
                id="edit-address"
                name="address"
                value={newProvider.address}
                onChange={handleInputChange}
                placeholder="123 Business St, City"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-paymentTerms">{t("Payment Terms")}</Label>
              <Input
                id="edit-paymentTerms"
                name="paymentTerms"
                value={newProvider.paymentTerms}
                onChange={handleInputChange}
                placeholder="Net 30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProviderOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleEditProvider}>{t("Save Changes")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Provider Dialog */}
      <Dialog open={isDeleteProviderOpen} onOpenChange={setIsDeleteProviderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("Delete Provider")}</DialogTitle>
            <DialogDescription>
              {t("Are you sure you want to delete this provider? This action cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              <p className="text-sm">
                {t("You are about to delete")} <strong>{selectedProvider?.name}</strong>.{" "}
                {t("This will remove all associated data.")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteProviderOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProvider}>
              {t("Delete Provider")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Place Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("Place Order with")} {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>{t("Enter the details for your order.")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="order-products">{t("Products")}</Label>
              <Input id="order-products" placeholder={t("Enter products to order")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order-quantity">{t("Quantity")}</Label>
              <Input id="order-quantity" type="number" placeholder="1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order-notes">{t("Order Notes")}</Label>
              <Textarea id="order-notes" placeholder={t("Add any special instructions")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order-delivery">{t("Delivery Date")}</Label>
              <Input id="order-delivery" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handlePlaceOrder}>{t("Place Order")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Provider Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("Contact")} {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>{t("Send a message to this provider.")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{selectedProvider?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{selectedProvider?.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{selectedProvider?.address}</span>
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="contact-subject">{t("Subject")}</Label>
              <Input id="contact-subject" placeholder={t("Enter message subject")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-message">{t("Message")}</Label>
              <Textarea id="contact-message" placeholder={t("Type your message here")} rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleContact}>{t("Send Message")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
