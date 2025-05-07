"use server"

import type { Payment } from "@/types/Payment"
import { PaymentAPI } from "@/services/apiClient"

export async function completePayment(paymentId: number, amount: number) {
  try {
    await PaymentAPI.complete(paymentId, amount)
    return { success: true }
  } catch (error) {
    console.error("Error completing payment:", error)
    return { success: false, error: "Failed to complete payment" }
  }
}

export async function deferPayment(paymentId: number, deferredDays: number) {
  try {
    await PaymentAPI.defer(paymentId, deferredDays)
    return { success: true }
  } catch (error) {
    console.error("Error deferring payment:", error)
    return { success: false, error: "Failed to defer payment" }
  }
}

export async function abandonPayment(paymentId: number) {
  try {
    await PaymentAPI.abandon(paymentId)
    return { success: true }
  } catch (error) {
    console.error("Error abandoning payment:", error)
    return { success: false, error: "Failed to abandon payment" }
  }
}

export async function getPayments(): Promise<Payment[]> {
  try {
    return await PaymentAPI.getAll()
  } catch (error) {
    console.error("Error fetching payments:", error)
    // Return empty array on error
    return []
  }
}

export async function getPaymentsByStatus(status: string): Promise<Payment[]> {
  try {
    return await PaymentAPI.getByStatus(status)
  } catch (error) {
    console.error(`Error fetching payments with status ${status}:`, error)
    // Return empty array on error
    return []
  }
}
