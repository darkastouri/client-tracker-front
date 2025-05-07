"use client"

import type React from "react"

import { useState } from "react"
import { 
  AlertCircle, 
  BarChart3, 
  Edit, 
  LineChart, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2,
  Package,
  Filter,
  ArrowUpDown,
  CheckCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "@/hooks/useTranslation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

// Enhanced mock data for products with inventory and sales data
const products = [
  {
    id: 1,
    name: "Premium Leather Wallet",
    price: 49.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Handcrafted genuine leather wallet with multiple card slots and coin pocket.",
    quantity: 15,
    minQuantity: 10,
    maxQuantity: 100,
    provider: "Leather Goods Co",
    salesVelocity: "high", // high, medium, low
    totalSold: 250,
    lastRestocked: "2024-02-01",
    category: "Accessories",
    tags: ["leather", "wallets", "accessories"],
    stats: {
      lastMonthSales: 45,
      averageMonthlySales: 38,
      profitMargin: 0.4,
    },
  },
  {
    id: 2,
    name: "Wireless Earbuds",
    price: 89.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "High-quality wireless earbuds with noise cancellation and long battery life.",
    quantity: 8,
    minQuantity: 15,
    maxQuantity: 150,
    provider: "Tech Components Inc",
    salesVelocity: "high",
    totalSold: 180,
    lastRestocked: "2024-02-10",
    category: "Electronics",
    tags: ["electronics", "audio", "wireless"],
    stats: {
      lastMonthSales: 32,
      averageMonthlySales: 30,
      profitMargin: 0.45,
    },
  },
  {
    id: 3,
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Double-walled insulated water bottle that keeps drinks cold for 24 hours.",
    quantity: 50,
    minQuantity: 20,
    maxQuantity: 200,
    provider: "Quality Goods Co",
    salesVelocity: "medium",
    totalSold: 320,
    lastRestocked: "2024-02-05",
    category: "Lifestyle",
    tags: ["lifestyle", "bottles", "eco-friendly"],
    stats: {
      lastMonthSales: 28,
      averageMonthlySales: 25,
      profitMargin: 0.55,
    },
  },
  {
    id: 4,
    name: "Smart Watch Pro",
    price: 199.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Advanced smartwatch with health tracking and notifications.",
    quantity: 22,
    minQuantity: 15,
    maxQuantity: 100,
    provider: "Tech Components Inc",
    salesVelocity: "high",
    totalSold: 156,
    lastRestocked: "2024-01-20",
    category: "Electronics",
    tags: ["electronics", "wearables", "tech"],
    stats: {
      lastMonthSales: 36,
      averageMonthlySales: 32,
      profitMargin: 0.38,
    },
  },
  {
    id: 5,
    name: "Natural Bamboo Cutting Board",
    price: 34.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Eco-friendly bamboo cutting board for your kitchen.",
    quantity: 30,
    minQuantity: 10,
    maxQuantity: 80,
    provider: "EcoHome Products",
    salesVelocity: "medium",
    totalSold: 210,
    lastRestocked: "2024-01-15",
    category: "Lifestyle",
    tags: ["kitchen", "eco-friendly", "bamboo"],
    stats: {
      lastMonthSales: 18,
      averageMonthlySales: 22,
      profitMargin: 0.62,
    },
  },
]

// Helper function to determine stock status
function getStockStatus(quantity: number, minQuantity: number, maxQuantity: number) {
  if (quantity <= minQuantity) return "low"
  if (quantity >= maxQuantity * 0.8) return "high"
  return "normal"
}

// Helper function to get stock status styles
function getStockStatusStyles(status: string) {
  switch (status) {
    case "low":
      return {
        badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        progress: "bg-red-500",
      }
    case "high":
      return {
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        progress: "bg-blue-500",
      }
    default:
      return {
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        progress: "bg-emerald-500",
      }
  }
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("grid")
  const { t } = useTranslation()
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    quantity: "",
    minQuantity: "",
    maxQuantity: "",
    provider: "",
    category: "",
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  // Get products that need attention (low stock and high sales velocity)
  const productsNeedingAttention = products.filter(
    (product) =>
      getStockStatus(product.quantity, product.minQuantity, product.maxQuantity) === "low" &&
      product.salesVelocity === "high",
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProduct((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddProduct = () => {
    // In a real app, you would call your API here
    setIsAddProductOpen(false)
    setNewProduct({
      name: "",
      price: "",
      description: "",
      image: "",
      quantity: "",
      minQuantity: "",
      maxQuantity: "",
      provider: "",
      category: "",
    })
  }

  const calculatePercentage = (quantity: number, maxQuantity: number) => {
    return Math.min(Math.round((quantity / maxQuantity) * 100), 100)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("Product Catalog")}</h1>
          <p className="page-description">{t("Manage your products and inventory")}</p>
        </div>
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("Add Product")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("Add New Product")}</DialogTitle>
              <DialogDescription>{t("Enter the product details and inventory information.")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("Product Name")}</Label>
                <Input
                  id="name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  placeholder={t("Product name")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="price">{t("Price")}</Label>
                <Input
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="category">{t("Category")}</Label>
                  <Select name="category" onValueChange={(value) => setNewProduct((prev) => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accessories">{t("Accessories")}</SelectItem>
                      <SelectItem value="Electronics">{t("Electronics")}</SelectItem>
                      <SelectItem value="Lifestyle">{t("Lifestyle")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t("Product Description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  placeholder={t("Product description")}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">{t("Image URL")}</Label>
                <Input
                  id="image"
                  name="image"
                  value={newProduct.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">{t("Initial Quantity")}</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  type="number"
                />
              </div>
                <div className="grid gap-2">
                  <Label htmlFor="minQuantity">{t("Min Quantity")}</Label>
                  <Input
                    id="minQuantity"
                    name="minQuantity"
                    value={newProduct.minQuantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    type="number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxQuantity">{t("Max Quantity")}</Label>
                  <Input
                    id="maxQuantity"
                    name="maxQuantity"
                    onChange={handleInputChange}
                    value={newProduct.maxQuantity}
                    placeholder="0"
                    type="number"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="provider">{t("Provider")}</Label>
                <Select name="provider" onValueChange={(value) => setNewProduct((prev) => ({ ...prev, provider: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select provider")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tech Components Inc">Tech Components Inc</SelectItem>
                    <SelectItem value="Leather Goods Co">Leather Goods Co</SelectItem>
                    <SelectItem value="Quality Goods Co">Quality Goods Co</SelectItem>
                    <SelectItem value="EcoHome Products">EcoHome Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddProduct} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                {t("Save Product")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert for products that need attention */}
      {productsNeedingAttention.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500 flex items-center text-sm font-medium">
            {t("Low Stock Alert")}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground text-sm">
            {t("The following products are running low and have high sales velocity:")}
            <ul className="mt-2 space-y-1">
              {productsNeedingAttention.map((product) => (
                <li key={product.id} className="flex items-center justify-between">
                  <span>{product.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("Only")} {product.quantity} {t("units left")}
                  </span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
              placeholder={t("Search products...")}
              className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t("Category")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
                {selectedCategory === "all" && <CheckCircle className="mr-2 h-4 w-4" />}
                {t("All Categories")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("accessories")}>
                {selectedCategory === "accessories" && <CheckCircle className="mr-2 h-4 w-4" />}
                {t("Accessories")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("electronics")}>
                {selectedCategory === "electronics" && <CheckCircle className="mr-2 h-4 w-4" />}
                {t("Electronics")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("lifestyle")}>
                {selectedCategory === "lifestyle" && <CheckCircle className="mr-2 h-4 w-4" />}
                {t("Lifestyle")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t("Sort")}</DropdownMenuLabel>
              <DropdownMenuItem>
                {t("Name (A-Z)")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("Name (Z-A)")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("Price (Low-High)")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("Price (High-Low)")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("Stock (Low-High)")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid grid-cols-2 h-9 w-[160px]">
            <TabsTrigger value="grid" className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block text-xs">{t("Grid")}</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-1">
              <LineChart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block text-xs">{t("Table")}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Products Display */}
      <div className="flex-1">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="grid" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.quantity, product.minQuantity, product.maxQuantity)
          const statusStyles = getStockStatusStyles(stockStatus)
                const stockPercentage = calculatePercentage(product.quantity, product.maxQuantity)

          return (
                  <Card key={product.id} className="dashboard-card overflow-hidden flex flex-col card-hover">
                    <div className="relative h-48 bg-muted">
                <img
                        src={product.image}
                  alt={product.name}
                        className="h-full w-full object-cover"
                />
                      <Badge className={`absolute top-2 right-2 ${statusStyles.badge}`}>
                        {t(stockStatus + " stock")}
                  </Badge>
              </div>
              <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                          <CardDescription className="text-muted-foreground mt-1">
                            {product.category}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${product.price}</div>
                          <CardDescription className="text-muted-foreground">{t("Price")}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm flex-grow">
                      <p className="line-clamp-2 text-muted-foreground mb-4">
                        {product.description}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{t("Stock Level")}</span>
                            <span className="text-sm font-medium">
                              {product.quantity} / {product.maxQuantity} {t("units")}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${statusStyles.progress}`}
                              style={{ width: `${stockPercentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>{t("min")}: {product.minQuantity}</span>
                            <span>{t("max")}: {product.maxQuantity}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1 text-sm">
                          <span className="text-muted-foreground">{t("Sales Velocity")}:</span>
                          <Badge variant={product.salesVelocity === "high" ? "default" : product.salesVelocity === "medium" ? "outline" : "secondary"}>
                            {t(product.salesVelocity)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{t("Total Sold")}:</span>
                          <span className="font-medium">{product.totalSold}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{t("provider")}:</span>
                          <span className="font-medium">{product.provider}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t flex justify-between">
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                        {t("View Details")}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="mr-2 h-4 w-4" />
                            {t("restock")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("Delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="table" className="mt-0">
            <Card>
              <Table className="data-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Product Name")}</TableHead>
                    <TableHead>{t("Category")}</TableHead>
                    <TableHead className="text-right">{t("Price")}</TableHead>
                    <TableHead className="text-center">{t("Stock")}</TableHead>
                    <TableHead className="text-center">{t("Status")}</TableHead>
                    <TableHead className="text-right">{t("Total Sold")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.quantity, product.minQuantity, product.maxQuantity)
                    const statusStyles = getStockStatusStyles(stockStatus)
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                  <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.provider}</div>
                            </div>
                  </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right font-medium">${product.price}</TableCell>
                        <TableCell className="text-center">{product.quantity} / {product.maxQuantity}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={statusStyles.badge}>
                            {t(stockStatus + " stock")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{product.totalSold}</TableCell>
                        <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                                {t("Edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                {t("restock")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                                {t("Delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
