"use server"

import { cookies } from "next/headers"

export async function login(email: string, password: string) {
  // In a real app, you would validate credentials against a database
  // For the MVP, we'll simulate a successful login

  // Set a cookie to simulate authentication
  cookies().set("auth-token", "simulated-jwt-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return { success: true }
}

export async function logout() {
  cookies().delete("auth-token")
  return { success: true }
}

export async function register(name: string, email: string, password: string) {
  // In a real app, you would create a user in the database
  // For the MVP, we'll simulate a successful registration

  return { success: true }
}
