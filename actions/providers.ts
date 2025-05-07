"use server"

import type { Provider } from "@/types/Provider"

// Mock data for providers
const mockProviders: Provider[] = [
  {
    id: 1,
    name: "Leather Goods Co",
    email: "contact@leathergoods.com",
    phone: "+1 555-123-4567",
    status: "active",
    created_at: new Date("2023-10-15"),
    updated_at: new Date("2024-01-10"),
  },
  {
    id: 2,
    name: "Tech Components Inc",
    email: "info@techcomponents.com",
    phone: "+1 555-987-6543",
    status: "active",
    created_at: new Date("2023-11-05"),
    updated_at: new Date("2024-01-20"),
  },
  // Add more mock providers as needed
]

export async function getProviders() {
  // In a real app, you would fetch providers from a database
  return mockProviders
}

export async function getProvider(id: number) {
  // In a real app, you would fetch a provider from a database
  return mockProviders.find((provider) => provider.id === id) || null
}

export async function createProvider(provider: Omit<Provider, "id" | "created_at" | "updated_at">) {
  // In a real app, you would create a provider in a database
  return { success: true, id: Math.floor(Math.random() * 1000) + 3 }
}
