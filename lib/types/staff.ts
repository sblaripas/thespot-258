// Staff and Role Management Types
import type { Language } from "./language" // Assuming Language is defined in another file

export interface Role {
  id: string
  tenant_id: string
  name_pt: string
  name_en: string
  color: string
  can_manage_orders: boolean
  can_manage_tables: boolean
  can_manage_menu: boolean
  can_manage_inventory: boolean
  can_manage_staff: boolean
  can_view_reports: boolean
  can_manage_settings: boolean
  access_level: number
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  role_id: string | null
  role?: Role
  pin_hash: string | null
  language_preference: Language
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Shift {
  id: string
  tenant_id: string
  shift_number: string
  employee_id: string
  employee?: Employee
  start_time: string
  end_time: string | null
  opening_balance: number
  closing_balance: number | null
  expected_cash: number | null
  actual_cash: number | null
  cash_difference: number | null
  total_sales: number
  total_orders: number
  total_transactions: number
  status: "open" | "closed" | "pending_review"
  notes: string | null
  created_at: string
  updated_at: string
}
