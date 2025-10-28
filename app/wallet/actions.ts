"use server"

import { executeServiceQuery } from "@/lib/db/client"

export async function getWalletByPhone(clientPhone: string) {
  const cleanPhone = clientPhone.replace(/\D/g, "")

  const result = await executeServiceQuery((client) =>
    client.from("wallets").select("*").eq("client_phone", cleanPhone).single(),
  )

  if (result.error && result.error.code !== "PGRST116") {
    console.error("[v0] Error fetching wallet:", result.error)
    return { data: null, error: result.error.message }
  }

  return { data: result.data, error: null }
}

export async function getWalletTransactions(walletId: string) {
  const result = await executeServiceQuery((client) =>
    client
      .from("transactions")
      .select("*")
      .eq("wallet_id", walletId)
      .order("created_at", { ascending: false })
      .limit(10),
  )

  if (result.error) {
    console.error("[v0] Error fetching transactions:", result.error)
    return { data: [], error: result.error.message }
  }

  return { data: result.data || [], error: null }
}
