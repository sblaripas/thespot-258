import type { Language } from "./tenant"

export interface MenuItem {
  id: string
  tenant_id: string
  name_pt: string
  name_en: string
  description_pt: string | null
  description_en: string | null
  category_id: string | null
  category?: Category
  size: string | null
  cost_price: number
  selling_price: number
  discount_price: number | null
  show_discount: boolean
  track_stock: boolean
  stock_count: number
  low_stock_threshold: number
  allow_out_of_stock_orders: boolean
  is_available: boolean
  available_times: string | null
  image_url: string | null
  preparation_time: number | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name_pt: string
  name_en: string
  description_pt: string | null
  description_en: string | null
  display_order: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Helper function to get localized menu item name
export function getMenuItemName(item: MenuItem, language: Language): string {
  return language === "pt" ? item.name_pt : item.name_en
}

// Helper function to get localized menu item description
export function getMenuItemDescription(item: MenuItem, language: Language): string | null {
  return language === "pt" ? item.description_pt : item.description_en
}

// Helper function to get localized category name
export function getCategoryName(category: Category, language: Language): string {
  return language === "pt" ? category.name_pt : category.name_en
}

export interface MenuFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  availableOnly?: boolean
}

export interface MenuSortOptions {
  field: "name" | "price" | "stock_quantity"
  direction: "asc" | "desc"
}

export interface PaginationOptions {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
