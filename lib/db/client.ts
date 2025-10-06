import { createClient as createSupabaseClient, createServiceClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

let clientInstance: SupabaseClient | null = null

/**
 * Get or create a Supabase client instance
 * Uses singleton pattern to avoid creating multiple clients
 */
export async function getDbClient(): Promise<SupabaseClient> {
  if (!clientInstance) {
    clientInstance = await createSupabaseClient()
  }
  return clientInstance
}

/**
 * Get a service role client that bypasses RLS
 * Use ONLY for public read operations like menu items
 */
export function getServiceClient(): SupabaseClient {
  return createServiceClient()
}

/**
 * Reset the client instance (useful for testing or when needed)
 */
export function resetDbClient(): void {
  clientInstance = null
}

/**
 * Execute a database query with error handling
 */
export async function executeQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const client = await getDbClient()
    const { data, error } = await queryFn(client)

    if (error) {
      console.error("[DB Error]", error)
      return {
        data: null,
        error: error.message || "Database query failed",
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("[DB Exception]", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

/**
 * Execute a database query using service role (bypasses RLS)
 * Use ONLY for public read operations
 */
export async function executeServiceQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const client = getServiceClient()
    const { data, error } = await queryFn(client)

    if (error) {
      console.error("[DB Error]", error)
      return {
        data: null,
        error: error.message || "Database query failed",
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("[DB Exception]", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}
