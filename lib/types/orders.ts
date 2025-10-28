// Order Management Types
import type { Language } from "./tenant"
import type { MenuItem } from "./menu"
import type { Employee } from "./staff"

export interface Order {
  id: string
  tenant_id: string
  order_number: string
  table_id: string | null
  table?: RestaurantTable
  customer_id: string | null
  waiter_id: string | null
  waiter?: Employee
  status: OrderStatus
  type: OrderType
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  placed_at: string
  confirmed_at: string | null
  prepared_at: string | null
  served_at: string | null
  completed_at: string | null
  notes_pt: string | null
  notes_en: string | null
  customer_notes: string | null
  estimated_prep_time: number | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled"
  | "refunded"

export type OrderType = "dine-in" | "takeaway" | "delivery"

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  menu_item?: MenuItem
  quantity: number
  unit_price: number
  cost_price_at_time: number
  selling_price_at_time: number
  special_instructions_pt: string | null
  special_instructions_en: string | null
  modifiers: Record<string, unknown> | null
  subtotal: number
  status: OrderItemStatus
  created_at: string
  updated_at: string
}

export type OrderItemStatus = "pending" | "preparing" | "ready" | "served" | "cancelled"

export interface RestaurantTable {
  id: string
  tenant_id: string
  number: string
  name_pt: string | null
  name_en: string | null
  status: TableStatus
  capacity: number
  min_capacity: number
  max_capacity: number | null
  location_zone: string | null
  position_x: number | null
  position_y: number | null
  shape: TableShape
  dimensions: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning" | "maintenance"

export type TableShape = "rectangle" | "circle" | "square"

export interface TableReservation {
  id: string
  tenant_id: string
  table_id: string
  table?: RestaurantTable
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  party_size: number
  reservation_time: string
  duration_minutes: number
  status: ReservationStatus
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ReservationStatus = "confirmed" | "seated" | "cancelled" | "no-show"

// Helper function to get localized table name
export function getTableName(table: RestaurantTable, language: Language): string {
  const localizedName = language === "pt" ? table.name_pt : table.name_en
  return localizedName || `Mesa ${table.number}`
}
