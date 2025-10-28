import type { SupabaseClient } from "@supabase/supabase-js"
import type { MenuFilters, MenuSortOptions, PaginationOptions } from "@/lib/types/menu"

/**
 * Build a query for fetching menu items with filters
 */
export function buildMenuItemsQuery(
  client: SupabaseClient,
  filters?: MenuFilters,
  sort?: MenuSortOptions,
  pagination?: PaginationOptions,
) {
  let query = client.from("menu_items").select("*", { count: "exact" })

  // Apply filters
  if (filters?.category) {
    query = query.eq("category", filters.category)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice)
  }

  if (filters?.availableOnly !== false) {
    query = query.eq("is_available", true)
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.field, { ascending: sort.direction === "asc" })
  } else {
    query = query.order("name", { ascending: true })
  }

  // Apply pagination
  if (pagination) {
    const from = (pagination.page - 1) * pagination.pageSize
    const to = from + pagination.pageSize - 1
    query = query.range(from, to)
  }

  return query
}

/**
 * Build a query for fetching menu items with filters (service client version)
 * This bypasses RLS and should only be used for public read operations
 */
export function buildMenuItemsServiceQuery(
  client: SupabaseClient,
  filters?: MenuFilters,
  sort?: MenuSortOptions,
  pagination?: PaginationOptions,
) {
  // Same implementation as buildMenuItemsQuery
  return buildMenuItemsQuery(client, filters, sort, pagination)
}

/**
 * Fetch a single menu item by ID
 */
export async function fetchMenuItemById(client: SupabaseClient, id: string) {
  return await client.from("menu_items").select("*").eq("id", id).single()
}

/**
 * Fetch menu items by category
 */
export async function fetchMenuItemsByCategory(client: SupabaseClient, category: string) {
  return await client.from("menu_items").select("*").eq("category", category).eq("is_available", true).order("name")
}

/**
 * Fetch all available categories
 */
export async function fetchCategories(client: SupabaseClient) {
  return await client.from("menu_items").select("category").eq("is_available", true)
}

/**
 * Update menu item stock
 */
export async function updateMenuItemStock(client: SupabaseClient, id: string, quantity: number) {
  return await client.from("menu_items").update({ stock_quantity: quantity }).eq("id", id)
}

/**
 * Check if menu item is available
 */
export async function checkMenuItemAvailability(client: SupabaseClient, id: string) {
  const { data, error } = await client.from("menu_items").select("is_available, stock_quantity").eq("id", id).single()

  if (error || !data) {
    return { available: false, stock: 0 }
  }

  return {
    available: data.is_available && data.stock_quantity > 0,
    stock: data.stock_quantity,
  }
}
