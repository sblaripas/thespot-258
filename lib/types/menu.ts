export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  is_available: boolean
  stock_quantity: number
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface MenuCategory {
  id: string
  name: string
  icon: string
  display_order?: number
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
