"use server"

import type { Order } from "@/types/Order"
import type { Payment } from "@/types/Payment"
import { OrderAPI } from "@/services/apiClient"

export async function createOrder(clientId: number, items: { productId: number; quantity: number }[]) {
  // In a real app, you would create an order in a database
  return { success: true, orderId: Math.floor(Math.random() * 1000) + 1 }
}

export async function getOrders(): Promise<Order[]> {
  try {
    return await OrderAPI.getAll()
  } catch (error) {
    console.error("Error fetching orders:", error)
    // Return empty array on error
    return []
  }
}

export async function getOrder(id: number): Promise<Order | null> {
  try {
    return await OrderAPI.getById(id)
  } catch (error) {
    console.error(`Error fetching order with id ${id}:`, error)
    return null
  }
}

export async function getOrderPayments(orderId: number): Promise<Payment[]> {
  try {
    return await OrderAPI.getPayments(orderId)
  } catch (error) {
    console.error(`Error fetching payments for order ${orderId}:`, error)
    // Return empty array on error
    return []
  }
}
