"use server"

import type { Client } from "@/types/Client"
import type { Payment } from "@/types/Payment"
import { ClientAPI } from "@/services/apiClient"

export async function getClients() {
  try {
    return await ClientAPI.getAll()
  } catch (error) {
    console.error("Error fetching clients:", error)
    // Return empty array on error
    return []
  }
}

export async function getClient(id: number) {
  try {
    return await ClientAPI.getById(id)
  } catch (error) {
    console.error(`Error fetching client with id ${id}:`, error)
    return null
  }
}

export async function updateClientScore(clientId: number, scoreChange: number, reason: string) {
  // In a real app, you would update the client's score in a database
  return { success: true }
}

export async function getClientPayments(clientId: number): Promise<Payment[]> {
  try {
    return await ClientAPI.getPayments(clientId)
  } catch (error) {
    console.error(`Error fetching payments for client ${clientId}:`, error)
    // Return empty array on error
    return []
  }
}
