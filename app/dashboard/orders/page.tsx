"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Receipt, ShoppingCart, Plus, Minus, Trash, Calendar, Loader2, Search, Phone, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTranslation } from "@/hooks/useTranslation"
import { useLayoutStore } from "@/store/useLayoutStore"
import { authHeader } from "@/utils/auth"
import { ClientService } from "@/services/clientService"
import { Client } from "@/types/Client"

// Mock data
const products = [
  {
    id: 1,
    name: "Premium Leather Wallet",
    price: 49.99,
    image: "/placeholder.svg?height=50&width=50",
    stock: 15,
  },
  {
    id: 2,
    name: "Wireless Earbuds",
    price: 89.99,
    image: "/placeholder.svg?height=50&width=50",
    stock: 8,
  },
  {
    id: 3,
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    image: "/placeholder.svg?height=50&width=50",
    stock: 50,
  },
  {
    id: 4,
    name: "Smart Watch",
    price: 199.99,
    image: "/placeholder.svg?height=50&width=50",
    stock: 12,
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    price: 79.99,
    image: "/placeholder.svg?height=50&width=50",
    stock: 20,
  },
]

interface OrderItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const { language } = useLayoutStore()
  const dir = language === "ar" ? "rtl" : "ltr"
  const [orderMode, setOrderMode] = useState<"quick" | "detailed">("quick")
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [quickProducts, setQuickProducts] = useState<{ id: number; name: string; price: string; quantity: number }[]>([
    { id: Date.now(), name: "", price: "", quantity: 1 },
  ])
  const [images, setImages] = useState<string[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [cartItems, setCartItems] = useState<OrderItem[]>([])
  const [advancePaymentDialog, setAdvancePaymentDialog] = useState(false)
  const [advanceAmount, setAdvanceAmount] = useState("")
  const [advanceComment, setAdvanceComment] = useState("")
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [createdOrderClientId, setCreatedOrderClientId] = useState<string>("")
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Helper function to get status color styles
  const getStatusColor = (status: string): string => {
    switch(status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "settled": return "bg-emerald-100 text-emerald-800";
      case "deferred": return "bg-amber-100 text-amber-800";
      case "outstanding": return "bg-red-100 text-red-800";
      case "abandoned": return "bg-gray-100 text-gray-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch clients from the API
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const params = clientSearch ? { search: clientSearch } : {};
        const response = await ClientService.getClients(params);
        if (response.success) {
          setClients(response.data.docs);
        } else {
          console.error("Failed to fetch clients:", response.message);
          toast({
            title: t("Error"),
            description: response.message || t("Failed to load clients"),
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: t("Error"),
          description: t("Failed to load clients"),
          variant: "destructive"
        });
      } finally {
        setIsLoadingClients(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const handler = setTimeout(() => {
      fetchClients();
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [clientSearch, toast, t]);

  const handleClientSearch = (value: string) => {
    setClientSearch(value);
  };

  const addQuickProduct = () => {
    setQuickProducts([...quickProducts, { id: Date.now(), name: "", price: "", quantity: 1 }])
  }

  const removeQuickProduct = (id: number) => {
    if (quickProducts.length === 1) {
      // Don't remove if it's the last product, just reset it
      setQuickProducts([{ id: Date.now(), name: "", price: "", quantity: 1 }])
    } else {
      setQuickProducts(quickProducts.filter((product) => product.id !== id))
    }
  }

  const updateQuickProduct = (id: number, field: "name" | "price" | "quantity", value: string | number) => {
    setQuickProducts(quickProducts.map((product) => (product.id === id ? { ...product, [field]: value } : product)))
  }

  const handleNumberClick = (value: string) => {
    // if (value === "." && amount.includes(".")) return
    // setAmount((prev) => prev + value)
  }

  const handleClear = () => {
    // setAmount("")
  }

  const handleBackspace = () => {
    // setAmount((prev) => prev.slice(0, -1))
  }

  const handleQuickAdd = () => {
    if (!selectedClient) {
      toast({
        title: t("Missing information"),
        description: t("Please select a client."),
        variant: "destructive",
      })
      return
    }

    const hasEmptyPrice = quickProducts.some((product) => !product.price)
    if (hasEmptyPrice) {
      toast({
        title: t("Missing information"),
        description: t("Please enter a price for all products."),
        variant: "destructive",
      })
      return
    }

    const orderItems = quickProducts.map((product) => ({
      id: product.id,
      productId: 0,
      name: product.name || t("Custom Product"),
      price: Number.parseFloat(product.price),
      quantity: product.quantity,
    }))

    setOrderItems(orderItems)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateOrder = async () => {
    if (!selectedClient) {
      toast({
        title: t("Select client"),
        description: t("Please select a client before creating the order."),
        variant: "destructive",
      })
      return
    }

    const clientId = selectedClient;

    if (orderMode === "quick" && quickProducts.some((p) => !p.price)) {
      toast({
        title: t("Enter amount"),
        description: t("Please enter an amount for all products."),
        variant: "destructive",
      })
      return
    }

    if (orderMode === "detailed" && cartItems.length === 0) {
      toast({
        title: t("Select Products"),
        description: t("Please add at least one product to your cart."),
        variant: "destructive",
      })
      return
    }

    setIsCreatingOrder(true);
    
    try {
      // Prepare the order data
      const orderData = {
        orders: [
          {
            discount: 0,
            date: new Date().toISOString().split('T')[0],
            items: orderMode === "quick" 
              ? quickProducts.map(product => ({
                  price: parseFloat(product.price),
                  quantity: product.quantity,
                  item: product.name || t("Custom Product")
                }))
              : cartItems.map(item => ({
                  price: item.price,
                  quantity: item.quantity,
                  item: item.name
                }))
          }
        ]
      };
      
      // Make the API call to create the order
      const response = await fetch(`https://client-tracker-back.onrender.com/api/orders/${clientId}`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      const result = await response.json();
      
      // Set the created order's client ID for the payment dialog
      setCreatedOrderClientId(clientId);
      
      // Reset form
      if (orderMode === "quick") {
        setQuickProducts([{ id: Date.now(), name: "", price: "", quantity: 1 }]);
      } else {
        setCartItems([]);
      }
      setImages([]);
      
      // Show success toast
      toast({
        title: t("Order created"),
        description: t("The order has been created successfully."),
      });
      
      // Show the advance payment dialog
      setAdvancePaymentDialog(true);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: t("Error"),
        description: error instanceof Error ? error.message : t("An error occurred while creating the order."),
        variant: "destructive"
      });
    } finally {
      setIsCreatingOrder(false);
    }
  }
  
  const handleAdvancePayment = async () => {
    if (!advanceAmount || parseFloat(advanceAmount) <= 0) {
      toast({
        title: t("Error"),
        description: t("Please enter a valid advance amount"),
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingOrder(true);
    
    try {
      const paymentData = {
        amount: parseFloat(advanceAmount),
        comment: advanceComment || t("Advance payment"),
        dueDate: dueDate
      };
      
      const response = await fetch(`https://client-tracker-back.onrender.com/api/payments/${createdOrderClientId}`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record advance payment');
      }
      
      // Show success toast
      toast({
        title: t("Advance payment recorded"),
        description: t("The advance payment has been recorded successfully."),
      });
      
      // Close dialog and redirect to dashboard
      setAdvancePaymentDialog(false);
      router.push("/dashboard");
      
    } catch (error) {
      console.error('Error recording advance payment:', error);
      toast({
        title: t("Error"),
        description: error instanceof Error ? error.message : t("An error occurred while recording the advance payment."),
        variant: "destructive"
      });
    } finally {
      setIsCreatingOrder(false);
    }
  }
  
  const skipAdvancePayment = () => {
    setAdvancePaymentDialog(false);
    router.push("/dashboard");
  }

  const addToCart = (product: (typeof products)[0]) => {
    const existingItem = cartItems.find((item) => item.productId === product.id)

    if (existingItem) {
      setCartItems(
        cartItems.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setCartItems([
        ...cartItems,
        {
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  const updateCartItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItem(itemId)
      return
    }

    setCartItems(cartItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const removeCartItem = (itemId: number) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId))
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("New Order")}</h2>
          <p className="text-muted-foreground">{t("Create a new order for your client")}</p>
        </div>
      </div>

      <Tabs defaultValue="quick" className="w-full" onValueChange={(v) => setOrderMode(v as "quick" | "detailed")}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="quick">{t("Quick Entry")}</TabsTrigger>
          <TabsTrigger value="detailed">{t("Detailed Entry")}</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left side - Quick Entry */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Quick Order Entry")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Client Selection */}
                    <div>
                      <Label>{t("Client")}</Label>
                      <div className="relative mt-1 mb-2">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Input
                          placeholder={t("Search clients...")}
                          value={clientSearch}
                          onChange={(e) => handleClientSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {isLoadingClients ? (
                        <div className="flex items-center justify-center p-4 mt-2 border rounded-md">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">{t("Loading clients...")}</span>
                        </div>
                      ) : clientSearch && clients.length > 0 ? (
                        <div className="mt-2 border rounded-md divide-y max-h-[300px] overflow-y-auto">
                          {clients.map((client) => (
                            <div 
                              key={client._id} 
                              className={`p-3 cursor-pointer hover:bg-muted transition-colors ${selectedClient === client._id ? 'bg-primary/10' : ''}`}
                              onClick={() => setSelectedClient(client._id)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{client.fullName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{client.fullName}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" /> 
                                    <span>{client.phoneNum}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                                    {t(client.status)}
                                  </span>
                                  <div className="mt-1 text-xs font-medium">
                                    {t("Score")}: {client.score}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : clientSearch ? (
                        <div className="flex flex-col items-center justify-center p-4 mt-2 border rounded-md">
                          <User className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">{t("No clients found")}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t("Try a different search term")}</p>
                        </div>
                      ) : null}
                      
                      {selectedClient && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{clients.find(c => c._id === selectedClient)?.fullName[0] || '?'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{clients.find(c => c._id === selectedClient)?.fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t("Phone")}: {clients.find(c => c._id === selectedClient)?.phoneNum}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedClient("")}>
                              <X className="h-4 w-4 mr-1" />
                              {t("Change")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Products Entry */}
                    <div className="space-y-4">
                      <Label>{t("Products")}</Label>

                      {quickProducts.map((product, index) => (
                        <div key={product.id} className="space-y-2 border p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {t("Product")} {index + 1}
                            </span>
                            {quickProducts.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuickProduct(product.id)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>{t("Product Name")}</Label>
                              <Input
                                value={product.name}
                                onChange={(e) => updateQuickProduct(product.id, "name", e.target.value)}
                                placeholder={t("Enter product name")}
                              />
                            </div>
                            <div>
                              <Label>{t("Price")}</Label>
                              <Input
                                value={product.price}
                                onChange={(e) =>
                                  updateQuickProduct(product.id, "price", e.target.value.replace(/[^\d.]/g, ""))
                                }
                                className="text-right"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label>{t("Quantity")}</Label>
                              <div className="flex items-center border rounded-md">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuickProduct(product.id, "quantity", Math.max(1, product.quantity - 1))
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{product.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuickProduct(product.id, "quantity", product.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button variant="outline" className="w-full" onClick={addQuickProduct}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("Add Another Product")}
                      </Button>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <Label>{t("Upload Invoice/Receipt (Optional)")}</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Attachment ${index + 1}`}
                              className="rounded-lg border object-cover aspect-video w-full"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 hover:bg-muted/50 cursor-pointer">
                          <Receipt className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{t("Upload invoice/receipt")}</p>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" size="lg" onClick={handleCreateOrder} disabled={isCreatingOrder}>
                    {isCreatingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Processing...")}
                      </>
                    ) : (
                      t("Create Quick Order")
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right side - Preview */}
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Order Summary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedClient && (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {clients.find(c => c._id === selectedClient)?.fullName[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{clients.find(c => c._id === selectedClient)?.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("Score")}: {clients.find(c => c._id === selectedClient)?.score}
                        </p>
                      </div>
                    </div>
                  )}

                  {quickProducts.some((p) => p.price) && (
                    <div className="space-y-3">
                      {quickProducts
                        .filter((p) => p.price)
                        .map((product) => (
                          <div key={product.id} className="p-4 rounded-lg bg-muted">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{product.name || t("Custom Product")}</span>
                              <span className="text-lg font-bold">
                                dt {Number.parseFloat(product.price).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-muted-foreground">
                                {t("Quantity")}: {product.quantity}
                              </span>
                              <span className="text-sm font-medium">
                                {t("Total")}: dt {(Number.parseFloat(product.price) * product.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}

                      <div className="p-4 rounded-lg bg-primary/10 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t("Order Total")}:</span>
                          <span className="text-xl font-bold">
                            dt{" "}
                            {quickProducts
                              .filter((p) => p.price)
                              .reduce((sum, p) => sum + Number.parseFloat(p.price) * p.quantity, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {images.length > 0 && (
                    <div>
                      <Label className="mb-2 block">{t("Attachments")}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {images.map((image, index) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Attachment ${index + 1}`}
                            className="rounded-lg border object-cover aspect-video w-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left side - Product Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Select Products")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Client Selection */}
                    <div className="mb-4">
                      <Label>{t("Client")}</Label>
                      <div className="relative mt-1 mb-2">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Input
                          placeholder={t("Search clients...")}
                          value={clientSearch}
                          onChange={(e) => handleClientSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {isLoadingClients ? (
                        <div className="flex items-center justify-center p-4 mt-2 border rounded-md">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">{t("Loading clients...")}</span>
                        </div>
                      ) : clientSearch && clients.length > 0 ? (
                        <div className="mt-2 border rounded-md divide-y max-h-[300px] overflow-y-auto">
                          {clients.map((client) => (
                            <div 
                              key={client._id} 
                              className={`p-3 cursor-pointer hover:bg-muted transition-colors ${selectedClient === client._id ? 'bg-primary/10' : ''}`}
                              onClick={() => setSelectedClient(client._id)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{client.fullName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{client.fullName}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" /> 
                                    <span>{client.phoneNum}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                                    {t(client.status)}
                                  </span>
                                  <div className="mt-1 text-xs font-medium">
                                    {t("Score")}: {client.score}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : clientSearch ? (
                        <div className="flex flex-col items-center justify-center p-4 mt-2 border rounded-md">
                          <User className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">{t("No clients found")}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t("Try a different search term")}</p>
                        </div>
                      ) : null}
                      
                      {selectedClient && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{clients.find(c => c._id === selectedClient)?.fullName[0] || '?'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{clients.find(c => c._id === selectedClient)?.fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t("Phone")}: {clients.find(c => c._id === selectedClient)?.phoneNum}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedClient("")}>
                              <X className="h-4 w-4 mr-1" />
                              {t("Change")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{product.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-medium">dt {product.price.toFixed(2)}</p>
                                <Badge variant="outline" className="text-xs">
                                  {product.stock} {t("in stock")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            className={`${dir === "rtl" ? "mr-2" : "ml-2"}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {t("Add to Cart")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Cart */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {t("Cart")}
                    </div>
                  </CardTitle>
                  <Badge variant="outline">
                    {cartItems.length} {t("items")}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">{t("Your cart is empty")}</div>
                    ) : (
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between border-b pb-3">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">dt {item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border rounded-md">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => removeCartItem(item.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {cartItems.length > 0 && (
                      <div className="pt-4">
                        <div className="flex items-center justify-between font-medium">
                          <span>{t("Order Total")}</span>
                          <span>dt {cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCreateOrder}
                    disabled={!selectedClient || cartItems.length === 0}
                  >
                    {t("Create Order")}
                  </Button>
                </CardFooter>
              </Card>

              {/* Image Upload (same as quick entry) */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Upload Invoice/Receipt (Optional)")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Attachment ${index + 1}`}
                          className="rounded-lg border object-cover aspect-video w-full"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 hover:bg-muted/50 cursor-pointer">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{t("Upload invoice/receipt")}</p>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Advance Payment Dialog */}
      <Dialog open={advancePaymentDialog} onOpenChange={setAdvancePaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Record Advance Payment")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="advanceAmount">{t("Advance Amount")}</Label>
              <Input
                id="advanceAmount"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value.replace(/[^\d.]/g, ""))}
                type="text"
                placeholder="0.00"
                className="col-span-2"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">{t("Due Date")}</Label>
              <div className="flex">
                <Input
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="col-span-2"
                />
                <Calendar className="ml-2 h-4 w-4 absolute right-8 top-[50%] translate-y-[-50%] text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("Format: YYYY-MM-DD")}
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="advanceComment">{t("Comment (Optional)")}</Label>
              <Input
                id="advanceComment"
                value={advanceComment}
                onChange={(e) => setAdvanceComment(e.target.value)}
                placeholder={t("Enter comment")}
                className="col-span-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={skipAdvancePayment} disabled={isCreatingOrder}>
              {t("Skip")}
            </Button>
            <Button onClick={handleAdvancePayment} disabled={isCreatingOrder}>
              {isCreatingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Processing...")}
                </>
              ) : (
                t("Record Payment")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
