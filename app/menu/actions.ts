"use server"

import { createClient } from "@/lib/supabase/server"

export async function getMenuItems() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("menu_items").select("*").eq("is_available", true).order("name")

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return { data: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}
