// Inventory Management Types
import type { MenuItem } from "./menu"
import type { Employee } from "./staff"

export interface InventoryLog {
  id: string
  tenant_id: string
  menu_item_id: string
  menu_item?: MenuItem
  change_type: InventoryChangeType
  change_amount: number
  previous_stock: number
  new_stock: number
  reason_pt: string | null
  reason_en: string | null
  cost_impact: number
  reference_id: string | null
  employee_id: string | null
  employee?: Employee
  created_at: string
}

export type InventoryChangeType = "sale" | "purchase" | "waste" | "adjustment" | "transfer" | "production"
