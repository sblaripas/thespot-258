"use server"

import { executeServiceQuery } from "@/lib/db/client"
import {
  buildMenuItemsServiceQuery,
  fetchMenuItemById,
  fetchMenuItemsByCategory,
  checkMenuItemAvailability,
} from "@/lib/db/queries/menu"
import { successResponse, errorResponse, handleDbError } from "@/lib/utils/response"
import { cache } from "@/lib/utils/cache"
import type { MenuItem, MenuFilters, MenuSortOptions, PaginationOptions, PaginatedResponse } from "@/lib/types/menu"
import type { ApiResponse } from "@/lib/types/common"

/**
 * Fetch all menu items with optional filters, sorting, and pagination
 */
export async function getMenuItems(
  filters?: MenuFilters,
  sort?: MenuSortOptions,
  pagination?: PaginationOptions,
): Promise<ApiResponse<MenuItem[] | PaginatedResponse<MenuItem>>> {
  console.log("[v0] Fetching menu items with filters:", filters)

  // Generate cache key
  const cacheKey = `menu_items_${JSON.stringify({ filters, sort, pagination })}`

  // Check cache first
  const cached = cache.get<MenuItem[] | PaginatedResponse<MenuItem>>(cacheKey)
  if (cached) {
    console.log("[v0] Returning cached menu items")
    return successResponse(cached)
  }

  const result = await executeServiceQuery(async (client) => {
    const query = buildMenuItemsServiceQuery(client, filters, sort, pagination)
    const { data, error, count } = await query

    if (error) {
      return { data: null, error }
    }

    // If pagination is requested, return paginated response
    if (pagination && count !== null) {
      const paginatedData: PaginatedResponse<MenuItem> = {
        data: data || [],
        total: count,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages: Math.ceil(count / pagination.pageSize),
      }
      return { data: paginatedData, error: null }
    }

    return { data: data || [], error: null }
  })

  if (result.error) {
    console.error("[v0] Error fetching menu items:", result.error)
    return errorResponse(handleDbError(result.error))
  }

  // Cache the result for 2 minutes
  if (result.data) {
    cache.set(cacheKey, result.data, 120)
  }

  console.log("[v0] Successfully fetched menu items:", result.data)
  return successResponse(result.data!)
}

/**
 * Fetch menu items by category (optimized for common use case)
 */
export async function getMenuItemsByCategory(category: string): Promise<ApiResponse<MenuItem[]>> {
  console.log("[v0] Fetching menu items for category:", category)

  const cacheKey = `menu_category_${category}`
  const cached = cache.get<MenuItem[]>(cacheKey)

  if (cached) {
    console.log("[v0] Returning cached category items")
    return successResponse(cached)
  }

  const result = await executeServiceQuery(async (client) => {
    return await fetchMenuItemsByCategory(client, category)
  })

  if (result.error) {
    console.error("[v0] Error fetching category items:", result.error)
    return errorResponse(handleDbError(result.error))
  }

  if (result.data) {
    cache.set(cacheKey, result.data, 120)
  }

  return successResponse(result.data || [])
}

/**
 * Fetch a single menu item by ID
 */
export async function getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
  console.log("[v0] Fetching menu item:", id)

  const cacheKey = `menu_item_${id}`
  const cached = cache.get<MenuItem>(cacheKey)

  if (cached) {
    return successResponse(cached)
  }

  const result = await executeServiceQuery(async (client) => {
    return await fetchMenuItemById(client, id)
  })

  if (result.error) {
    return errorResponse(handleDbError(result.error))
  }

  if (!result.data) {
    return errorResponse("Menu item not found")
  }

  cache.set(cacheKey, result.data, 300)
  return successResponse(result.data)
}

/**
 * Check if a menu item is available for ordering
 */
export async function checkItemAvailability(id: string): Promise<ApiResponse<{ available: boolean; stock: number }>> {
  const result = await executeServiceQuery(async (client) => {
    const availability = await checkMenuItemAvailability(client, id)
    return { data: availability, error: null }
  })

  if (result.error) {
    return errorResponse(handleDbError(result.error))
  }

  return successResponse(result.data!)
}

/**
 * Search menu items by name or description
 */
export async function searchMenuItems(searchTerm: string): Promise<ApiResponse<MenuItem[]>> {
  console.log("[v0] Searching menu items:", searchTerm)

  if (!searchTerm || searchTerm.trim().length < 2) {
    return errorResponse("Search term must be at least 2 characters")
  }

  return getMenuItems({ search: searchTerm.trim(), availableOnly: true })
}

/**
 * Clear menu cache (useful after updates)
 */
export async function clearMenuCache(): Promise<void> {
  cache.clear()
  console.log("[v0] Menu cache cleared")
}
