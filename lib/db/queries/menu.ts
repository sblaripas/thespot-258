import type { SupabaseClient } from "@supabase/supabase-js"
import type { MenuFilters, MenuSortOptions, PaginationOptions, MenuItem } from "@/lib/types/menu"
import type { Language } from "@/lib/types/tenant"

/**
 * Build a query for fetching menu items with filters (for service client)
 */
export function buildMenuItemsServiceQuery(
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
    const sortField = sort.field === "price" ? "price" : sort.field === "stock_quantity" ? "stock_quantity" : "name"
    query = query.order(sortField, { ascending: sort.direction === "asc" })
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
 * Build a query for fetching menu items with filters (for regular client with tenant)
 */
export function buildMenuItemsQuery(
  client: SupabaseClient,
  tenantId: string,
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
    const sortField = sort.field === "price" ? "price" : sort.field === "stock_quantity" ? "stock_quantity" : "name"
    query = query.order(sortField, { ascending: sort.direction === "asc" })
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
 * Fetch a single menu item by ID
 */
export async function fetchMenuItemById(client: SupabaseClient, id: string, tenantId?: string) {
  return await client.from("menu_items").select("*").eq("id", id).single()
}

/**
 * Fetch menu items by category
 */
export async function fetchMenuItemsByCategory(client: SupabaseClient, category: string, tenantId?: string) {
  return await client.from("menu_items").select("*").eq("category", category).eq("is_available", true).order("name")
}

/**
 * Fetch all categories for a tenant
 */
export async function fetchCategories(client: SupabaseClient, tenantId: string) {
  const { data, error } = await client.from("menu_items").select("category").eq("is_available", true)

  if (error || !data) {
    return { data: [], error }
  }

  // Extract unique categories
  const uniqueCategories = [...new Set(data.map((item) => item.category).filter(Boolean))]
  return {
    data: uniqueCategories.map((cat) => ({
      id: cat,
      name: cat,
      name_pt: cat,
      name_en: cat,
      is_active: true,
    })),
    error: null,
  }
}

/**
 * Update menu item stock
 */
export async function updateMenuItemStock(client: SupabaseClient, id: string, quantity: number, tenantId?: string) {
  return await client.from("menu_items").update({ stock_quantity: quantity }).eq("id", id)
}

/**
 * Check if menu item is available
 */
export async function checkMenuItemAvailability(client: SupabaseClient, id: string, tenantId?: string) {
  const { data, error } = await client.from("menu_items").select("is_available, stock_quantity").eq("id", id).single()

  if (error || !data) {
    return { available: false, stock: 0 }
  }

  const hasStock = data.stock_quantity > 0
  return {
    available: data.is_available && hasStock,
    stock: data.stock_quantity,
  }
}

/**
 * Get localized menu item name
 */
export function getLocalizedName(item: MenuItem, language: Language): string {
  return (language === "pt" ? item.name_pt : item.name_en) || item.name || ""
}

/**
 * Get localized menu item description
 */
export function getLocalizedDescription(item: MenuItem, language: Language): string | null {
  return (language === "pt" ? item.description_pt : item.description_en) || item.description || null
}
