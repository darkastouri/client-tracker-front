"use server"

import type { Product } from "@/types/Product"

// Mock data for products
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Leather Wallet",
    price: 49.99,
    description: "Handcrafted genuine leather wallet with multiple card slots and coin pocket.",
    stock: 15,
    provider_id: 1,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-02-01"),
    image: "/placeholder.svg?height=200&width=200",
    minQuantity: 10,
    maxQuantity: 100,
    provider: "Leather Goods Co",
    salesVelocity: "high",
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
    description: "High-quality wireless earbuds with noise cancellation and long battery life.",
    stock: 8,
    provider_id: 2,
    created_at: new Date("2024-01-05"),
    updated_at: new Date("2024-02-10"),
    image: "/placeholder.svg?height=200&width=200",
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
  // Add more mock products as needed
]

export async function getProducts() {
  // In a real app, you would fetch products from a database
  return mockProducts
}

export async function getProduct(id: number) {
  // In a real app, you would fetch a product from a database
  return mockProducts.find((product) => product.id === id) || null
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  // In a real app, you would create a product in a database
  return { success: true, id: Math.floor(Math.random() * 1000) + 3 }
}
