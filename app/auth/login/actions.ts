"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function sendOTP(phone: string) {
  const supabase = await createClient()

  try {
    // Check if user exists with this phone number
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[v0] Error fetching user:", fetchError)
      return { success: false, error: "Failed to check user" }
    }

    if (!existingUser) {
      return { success: false, error: "Phone number not registered. Please contact admin." }
    }

    console.log(`[v0] OTP request for ${phone}. Hardcoded OTP: ${existingUser.otp}`)

    // In development, return the OTP for testing
    return {
      success: true,
      message: "Please enter your OTP",
      otp: process.env.NODE_ENV === "development" ? existingUser.otp : undefined,
    }
  } catch (error) {
    console.error("[v0] Error in sendOTP:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function verifyOTP(phone: string, otp: string) {
  const supabase = await createClient()

  try {
    // Verify OTP
    const { data: user, error: verifyError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .eq("otp", otp)
      .single()

    if (verifyError || !user) {
      console.error("[v0] Invalid OTP:", verifyError)
      return { success: false, error: "Invalid OTP" }
    }

    // Create a session by setting a cookie
    const cookieStore = await cookies()
    cookieStore.set(
      "user_session",
      JSON.stringify({
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    console.log(`[v0] User ${user.name} logged in successfully`)

    return { success: true, user }
  } catch (error) {
    console.error("[v0] Error in verifyOTP:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("user_session")
  return { success: true }
}
