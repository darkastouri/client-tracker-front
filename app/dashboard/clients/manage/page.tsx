"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, CreditCard, Package, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Mock data for existing clients
const existingClients = [
  {
    id: 1,
    name: "Asma Jomaa",
    email: "asma@example.com",
    phone: "+1 234 567 890",
    status: "active",
    totalSpent: 1250.75,
    lastOrder: "2023-05-15",
    avatar: "/placeholder-user.jpg",
    paymentType: "installment", // installment or full
    paymentDates: [5, 15], // Days of month when client typically pays
  },
  {
    id: 2,
    name: "Bouzomita Ahmed",
    email: "ahmed@example.com",
    phone: "+1 234 567 891",
    status: "active",
    totalSpent: 890.5,
    lastOrder: "2023-06-02",
    avatar: "/placeholder-user.jpg",
    paymentType: "full",
    paymentDates: [],
  },
  {
    id: 3,
    name: "Toumi Naima",
    email: "naima@example.com",
    phone: "+1 234 567 892",
    status: "inactive",
    totalSpent: 450.25,
    lastOrder: "2023-04-20",
    avatar: "/placeholder-user.jpg",
    paymentType: "installment",
    paymentDates: [10, 25],
  },
]

// Mock data for products
const products = [
  { id: 1, name: "Premium Leather Wallet", price: 49.99 },
  { id: 2, name: "Wireless Earbuds", price: 89.99 },
  { id: 3, name: "Stainless Steel Water Bottle", price: 24.99 },
  { id: 4, name: "Smartphone Case", price: 19.99 },
  { id: 5, name: "Bluetooth Speaker", price: 59.99 },
  { id: 6, name: "Fitness Tracker", price: 79.99 },
]

// Form schema for client selection
const clientSelectionSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
})

// Form schema for order history
const orderSchema = z.object({
  date: z.date(),
  totalAmount: z.string().min(1, "Please enter the total amount"),
  discount: z.string().optional(),
  notes: z.string().optional(),
})

// Form schema for order item
const orderItemSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.string().min(1, "Please enter a quantity"),
  unitPrice: z.string().min(1, "Please enter a unit price"),
})

// Form schema for payment history
const paymentSchema = z.object({
  date: z.date(),
  amount: z.string().min(1, "Please enter an amount"),
  status: z.string().min(1, "Please select a status"),
  deferredToDate: z.date().optional(),
  notes: z.string().optional(),
})

type OrderItem = {
  id: string
  productId: string
  productName: string
  quantity: string
  unitPrice: string
  subtotal: number
}

type Order = {
  id: string
  date: Date
  items: OrderItem[]
  totalAmount: string
  discount: string
  notes: string
}

type PaymentItem = {
  id: string
  date: Date
  amount: string
  status: string
  deferredToDate?: Date
  notes: string
}

export default function ManageExistingClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [isAddingOrder, setIsAddingOrder] = useState(false)
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([])
  const [isAddingOrderItem, setIsAddingOrderItem] = useState(false)

  // Form for client selection
  const clientForm = useForm<z.infer<typeof clientSelectionSchema>>({
    resolver: zodResolver(clientSelectionSchema),
    defaultValues: {
      clientId: "",
    },
  })

  // Form for adding order history
  const orderForm = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      date: new Date(),
      totalAmount: "",
      discount: "0",
      notes: "",
    },
  })

  // Form for adding order item
  const orderItemForm = useForm<z.infer<typeof orderItemSchema>>({
    resolver: zodResolver(orderItemSchema),
    defaultValues: {
      productId: "",
      quantity: "1",
      unitPrice: "",
    },
  })

  // Form for adding payment history
  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: new Date(),
      amount: "",
      status: "completed",
      notes: "",
    },
  })

  // Handle client selection
  const onClientSelect = (values: z.infer<typeof clientSelectionSchema>) => {
    const client = existingClients.find((c) => c.id.toString() === values.clientId)
    setSelectedClient(client)

    // Reset orders and payments when changing clients
    setOrders([])
    setPayments([])

    toast({
      title: "Client selected",
      description: `${client?.name} has been selected.`,
    })
  }

  // Handle adding order item
  const onAddOrderItem = (values: z.infer<typeof orderItemSchema>) => {
    const product = products.find((p) => p.id.toString() === values.productId)

    const newOrderItem: OrderItem = {
      id: Date.now().toString(),
      productId: values.productId,
      productName: product?.name || "Unknown Product",
      quantity: values.quantity,
      unitPrice: values.unitPrice,
      subtotal: Number.parseFloat(values.quantity) * Number.parseFloat(values.unitPrice),
    }

    setCurrentOrderItems([...currentOrderItems, newOrderItem])
    setIsAddingOrderItem(false)
    orderItemForm.reset({
      productId: "",
      quantity: "1",
      unitPrice: "",
    })

    // Update the total amount in the order form
    const currentTotal = Number.parseFloat(orderForm.getValues("totalAmount") || "0")
    const newTotal = currentTotal + newOrderItem.subtotal
    orderForm.setValue("totalAmount", newTotal.toFixed(2))
  }

  // Handle removing order item
  const removeOrderItem = (id: string) => {
    const itemToRemove = currentOrderItems.find((item) => item.id === id)
    if (itemToRemove) {
      // Update the total amount in the order form
      const currentTotal = Number.parseFloat(orderForm.getValues("totalAmount") || "0")
      const newTotal = currentTotal - itemToRemove.subtotal
      orderForm.setValue("totalAmount", newTotal > 0 ? newTotal.toFixed(2) : "0")
    }

    setCurrentOrderItems(currentOrderItems.filter((item) => item.id !== id))
  }

  // Handle adding order history
  const onAddOrder = (values: z.infer<typeof orderSchema>) => {
    if (currentOrderItems.length === 0) {
      toast({
        title: "No products added",
        description: "Please add at least one product to the order.",
        variant: "destructive",
      })
      return
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      date: values.date,
      items: [...currentOrderItems],
      totalAmount: values.totalAmount,
      discount: values.discount || "0",
      notes: values.notes || "",
    }

    setOrders([...orders, newOrder])
    setIsAddingOrder(false)
    setCurrentOrderItems([])
    orderForm.reset({
      date: new Date(),
      totalAmount: "",
      discount: "0",
      notes: "",
    })

    toast({
      title: "Order added",
      description: "Historical order has been added successfully.",
    })
  }

  // Handle adding payment history
  const onAddPayment = (values: z.infer<typeof paymentSchema>) => {
    const newPayment: PaymentItem = {
      id: Date.now().toString(),
      date: values.date,
      amount: values.amount,
      status: values.status,
      deferredToDate: values.status === "deferred" ? values.deferredToDate : undefined,
      notes: values.notes || "",
    }

    setPayments([...payments, newPayment])
    setIsAddingPayment(false)
    paymentForm.reset({
      date: new Date(),
      amount: "",
      status: "completed",
      notes: "",
    })

    toast({
      title: "Payment added",
      description: "Historical payment has been added successfully.",
    })
  }

  // Handle removing an order
  const removeOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id))
    toast({
      title: "Order removed",
      description: "Historical order has been removed.",
    })
  }

  // Handle removing a payment
  const removePayment = (id: string) => {
    setPayments(payments.filter((payment) => payment.id !== id))
    toast({
      title: "Payment removed",
      description: "Historical payment has been removed.",
    })
  }

  // Handle saving all client history
  const saveClientHistory = () => {
    // In a real app, you would call your API here
    toast({
      title: "Client history saved",
      description: `${selectedClient?.name}'s history has been updated with ${orders.length} orders and ${payments.length} payments.`,
    })
    router.push("/dashboard/clients")
  }

  // Get payment status badge color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white"
      case "scheduled":
        return "bg-amber-500 text-white"
      case "deferred":
        return "bg-yellow-500 text-black"
      case "outstanding":
        return "bg-red-500 text-white"
      case "abandoned":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  // Calculate order total
  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.subtotal, 0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Existing Client</h2>
        <p className="text-muted-foreground">Add historical orders and payments for existing clients</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>Choose an existing client to manage their history</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit(onClientSelect)} className="space-y-4">
              <FormField
                control={clientForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {existingClients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.name} />
                                <AvatarFallback>{client.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{client.name}</span>
                              <Badge
                                variant={client.paymentType === "installment" ? "outline" : "secondary"}
                                className="ml-2"
                              >
                                {client.paymentType === "installment" ? "Installment" : "Full Payment"}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Select Client</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {selectedClient && (
        <>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedClient.avatar || "/placeholder.svg"} alt={selectedClient.name} />
              <AvatarFallback>{selectedClient.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{selectedClient.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{selectedClient.email}</span>
                <span>•</span>
                <span>{selectedClient.phone}</span>
              </div>
            </div>
            <div className="ml-auto flex flex-col items-end">
              <Badge variant={selectedClient.paymentType === "installment" ? "outline" : "secondary"}>
                {selectedClient.paymentType === "installment" ? "Installment Client" : "Full Payment Client"}
              </Badge>
              {selectedClient.paymentType === "installment" && selectedClient.paymentDates.length > 0 && (
                <span className="text-sm text-muted-foreground mt-1">
                  Payment dates: {selectedClient.paymentDates.join(", ")} of each month
                </span>
              )}
            </div>
          </div>

          <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Historical Orders</h3>
                <Button onClick={() => setIsAddingOrder(true)} disabled={isAddingOrder}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Order
                </Button>
              </div>

              {isAddingOrder && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Historical Order</CardTitle>
                    <CardDescription>Enter details of a past order for this client</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Order Items Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-medium">Order Items</h4>
                          <Button
                            onClick={() => setIsAddingOrderItem(true)}
                            disabled={isAddingOrderItem}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                          </Button>
                        </div>

                        {isAddingOrderItem && (
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <Form {...orderItemForm}>
                                <form onSubmit={orderItemForm.handleSubmit(onAddOrderItem)} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                      control={orderItemForm.control}
                                      name="productId"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Product</FormLabel>
                                          <Select
                                            onValueChange={(value) => {
                                              field.onChange(value)
                                              // Auto-fill the unit price based on the selected product
                                              const product = products.find((p) => p.id.toString() === value)
                                              if (product) {
                                                orderItemForm.setValue("unitPrice", product.price.toString())
                                              }
                                            }}
                                            defaultValue={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select a product" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {products.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                  {product.name} - ${product.price.toFixed(2)}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={orderItemForm.control}
                                      name="quantity"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Quantity</FormLabel>
                                          <FormControl>
                                            <Input type="number" min="1" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={orderItemForm.control}
                                      name="unitPrice"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Unit Price</FormLabel>
                                          <FormControl>
                                            <Input type="number" min="0" step="0.01" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAddingOrderItem(false)}>
                                      Cancel
                                    </Button>
                                    <Button type="submit">Add Product</Button>
                                  </div>
                                </form>
                              </Form>
                            </CardContent>
                          </Card>
                        )}

                        {currentOrderItems.length > 0 ? (
                          <div className="space-y-2">
                            <div className="rounded-md border">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b bg-muted/50">
                                    <th className="h-10 px-4 text-left font-medium">Product</th>
                                    <th className="h-10 px-4 text-right font-medium">Quantity</th>
                                    <th className="h-10 px-4 text-right font-medium">Unit Price</th>
                                    <th className="h-10 px-4 text-right font-medium">Subtotal</th>
                                    <th className="h-10 px-4 text-center font-medium">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {currentOrderItems.map((item) => (
                                    <tr key={item.id} className="border-b">
                                      <td className="p-4">{item.productName}</td>
                                      <td className="p-4 text-right">{item.quantity}</td>
                                      <td className="p-4 text-right">
                                        ${Number.parseFloat(item.unitPrice).toFixed(2)}
                                      </td>
                                      <td className="p-4 text-right">${item.subtotal.toFixed(2)}</td>
                                      <td className="p-4 text-center">
                                        <Button variant="ghost" size="icon" onClick={() => removeOrderItem(item.id)}>
                                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-muted/50 font-medium">
                                    <td className="p-4" colSpan={3}>
                                      Total
                                    </td>
                                    <td className="p-4 text-right">
                                      ${calculateOrderTotal(currentOrderItems).toFixed(2)}
                                    </td>
                                    <td className="p-4"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center border rounded-lg">
                            <Package className="h-8 w-8 text-muted-foreground mb-2" />
                            <h3 className="font-medium">No Products Added</h3>
                            <p className="text-sm text-muted-foreground">
                              Add products to this order using the button above.
                            </p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Order Details Section */}
                      <Form {...orderForm}>
                        <form onSubmit={orderForm.handleSubmit(onAddOrder)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={orderForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Order Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                          )}
                                        >
                                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarComponent
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={orderForm.control}
                              name="totalAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      {...field}
                                      value={field.value || calculateOrderTotal(currentOrderItems).toFixed(2)}
                                      readOnly={currentOrderItems.length > 0}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={orderForm.control}
                              name="discount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Discount</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="0" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={orderForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsAddingOrder(false)
                                setCurrentOrderItems([])
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Save Order</Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </CardContent>
                </Card>
              )}

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">Order from {format(order.date, "PPP")}</CardTitle>
                              <CardDescription>
                                {order.items.length} {order.items.length === 1 ? "product" : "products"}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">${Number.parseFloat(order.totalAmount).toFixed(2)}</p>
                              {Number.parseFloat(order.discount) > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Discount: ${Number.parseFloat(order.discount).toFixed(2)}
                                </p>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeOrder(order.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="h-8 px-4 text-left font-medium">Product</th>
                                <th className="h-8 px-4 text-right font-medium">Quantity</th>
                                <th className="h-8 px-4 text-right font-medium">Unit Price</th>
                                <th className="h-8 px-4 text-right font-medium">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item) => (
                                <tr key={item.id} className="border-b">
                                  <td className="p-2 px-4">{item.productName}</td>
                                  <td className="p-2 px-4 text-right">{item.quantity}</td>
                                  <td className="p-2 px-4 text-right">
                                    ${Number.parseFloat(item.unitPrice).toFixed(2)}
                                  </td>
                                  <td className="p-2 px-4 text-right">${item.subtotal.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {order.notes && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>Notes: {order.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">No Historical Orders</h3>
                  <p className="text-muted-foreground">Add past orders for this client to track their history.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Historical Payments</h3>
                <Button onClick={() => setIsAddingPayment(true)} disabled={isAddingPayment}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment
                </Button>
              </div>

              {isAddingPayment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Historical Payment</CardTitle>
                    <CardDescription>Enter details of a past payment for this client</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...paymentForm}>
                      <form onSubmit={paymentForm.handleSubmit(onAddPayment)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={paymentForm.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Payment Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground",
                                        )}
                                      >
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={paymentForm.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={paymentForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="deferred">Deferred</SelectItem>
                                    <SelectItem value="outstanding">Outstanding</SelectItem>
                                    <SelectItem value="abandoned">Abandoned</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {paymentForm.watch("status") === "deferred" && (
                            <FormField
                              control={paymentForm.control}
                              name="deferredToDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Deferred To Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                          )}
                                        >
                                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarComponent
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={paymentForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem className={paymentForm.watch("status") === "deferred" ? "md:col-span-2" : ""}>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddingPayment(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Add Payment</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">${Number.parseFloat(payment.amount).toFixed(2)}</h4>
                                <Badge className={getPaymentStatusColor(payment.status)}>
                                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(payment.date, "PPP")}
                                {payment.status === "deferred" && payment.deferredToDate && (
                                  <> • Deferred to: {format(payment.deferredToDate, "PPP")}</>
                                )}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removePayment(payment.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        {payment.notes && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>Notes: {payment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
                  <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">No Historical Payments</h3>
                  <p className="text-muted-foreground">
                    Add past payments for this client to track their payment history.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {(orders.length > 0 || payments.length > 0) && (
            <div className="flex justify-end mt-6">
              <Button onClick={saveClientHistory} size="lg">
                Save Client History
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
