"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("user_session")

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function getAllUsers() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return { success: false, error: "Failed to fetch users" }
    }

    return { success: true, users: data }
  } catch (error) {
    console.error("[v0] Error in getAllUsers:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function createUser(userData: {
  phone: string
  name: string
  role: string
}) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        phone: userData.phone,
        name: userData.name,
        role: userData.role,
        otp: null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating user:", error)
      return { success: false, error: "Failed to create user" }
    }

    return { success: true, user: data }
  } catch (error) {
    console.error("[v0] Error in createUser:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateUser(
  userId: string,
  userData: {
    phone?: string
    name?: string
    role?: string
  },
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("users").update(userData).eq("id", userId).select().single()

    if (error) {
      console.error("[v0] Error updating user:", error)
      return { success: false, error: "Failed to update user" }
    }

    return { success: true, user: data }
  } catch (error) {
    console.error("[v0] Error in updateUser:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("[v0] Error deleting user:", error)
      return { success: false, error: "Failed to delete user" }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in deleteUser:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
