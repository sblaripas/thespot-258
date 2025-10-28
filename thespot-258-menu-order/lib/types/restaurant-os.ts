// ========================
// RESTAURANTOS TYPE DEFINITIONS
// ========================

export interface Tenant {
  id: string
  name: string
  legal_name?: string
  domain: string
  province: MozambiqueProvince
  city: string
  address?: string
  phone?: string
  email?: string
  timezone: string
  base_language: "pt" | "en"
  currency: string
  nuit?: string
  licenca?: string
  is_active: boolean
  subscription_tier: "basic" | "pro" | "enterprise"
  created_at: string
  updated_at: string
}

export type MozambiqueProvince =
  | "Maputo"
  | "Gaza"
  | "Inhambane"
  | "Sofala"
  | "Manica"
  | "Tete"
  | "Zambézia"
  | "Nampula"
  | "Cabo Delgado"
  | "Niassa"

export interface TenantSettings {
  tenant_id: string
  languages: string[]
  default_language: string
  date_format: string
  time_format: string
  opening_time: string
  closing_time: string
  tax_enabled: boolean
  tax_rate: number
  tax_name: string
  payment_methods_enabled: PaymentMethod[]
  receipt_header_pt?: string
  receipt_header_en?: string
  receipt_footer_pt?: string
  receipt_footer_en?: string
  receipt_show_tax: boolean
  auto_table_status: boolean
  table_timeout_minutes: number
  created_at: string
  updated_at: string
}

export type PaymentMethod = "M-Pesa" | "e-Mola" | "wallet" | "cash" | "card" | "multicaixa" | "bank_transfer"

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
  can_issue_vouchers: boolean
  can_manage_qr_menus: boolean
  access_level: number
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  tenant_id: string
  name: string
  email?: string
  phone?: string
  password?: string
  role_id?: string
  role?: Role
  pin_hash?: string
  assigned_zones?: string[]
  language_preference: "pt" | "en"
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name_pt: string
  name_en: string
  description_pt?: string
  description_en?: string
  display_order: number
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  tenant_id: string
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  payment_terms?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Allergen {
  id: string
  tenant_id: string
  name_pt: string
  name_en: string
  description_pt?: string
  description_en?: string
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  tenant_id: string
  inventory_item_id?: string
  name_pt: string
  name_en: string
  description_pt?: string
  description_en?: string
  category_id?: string
  category?: Category
  size?: string
  cost_price: number
  selling_price: number
  discount_price?: number
  show_discount: boolean
  track_stock: boolean
  stock_count: number
  low_stock_threshold: number
  allow_out_of_stock_orders: boolean
  is_available: boolean
  event_eligible: boolean
  image_url?: string
  preparation_time?: number
  variants?: Record<string, any>
  tags?: string[]
  allergens?: Allergen[]
  created_at: string
  updated_at: string
}

export interface RestaurantTable {
  id: string
  tenant_id: string
  number: string
  name_pt?: string
  name_en?: string
  qr_code_url?: string
  status: "available" | "occupied" | "reserved" | "cleaning" | "maintenance"
  capacity: number
  min_capacity: number
  max_capacity?: number
  location_zone?: string
  position_x?: number
  position_y?: number
  shape: "rectangle" | "circle" | "square"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TableReservation {
  id: string
  tenant_id: string
  table_id?: string
  table?: RestaurantTable
  customer_name: string
  customer_phone?: string
  customer_email?: string
  party_size: number
  reservation_time: string
  duration_minutes: number
  status: "confirmed" | "seated" | "cancelled" | "no-show"
  confirmation_code?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  tenant_id: string
  order_number: string
  table_id?: string
  table?: RestaurantTable
  customer_id?: string
  waiter_id?: string
  waiter?: Employee
  qr_scan_id?: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled" | "refunded"
  type: "dine-in" | "takeaway" | "delivery"
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  guest_count: number
  payment_method?: PaymentMethod
  tax_compliant: boolean
  placed_at: string
  confirmed_at?: string
  prepared_at?: string
  served_at?: string
  completed_at?: string
  notes_pt?: string
  notes_en?: string
  customer_notes?: string
  estimated_prep_time?: number
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  menu_item?: MenuItem
  quantity: number
  unit_price: number
  cost_price_at_time: number
  selling_price_at_time: number
  special_instructions_pt?: string
  special_instructions_en?: string
  subtotal: number
  status: "pending" | "preparing" | "ready" | "served" | "cancelled"
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  tenant_id: string
  order_id: string
  order?: Order
  bill_number: string
  payment_method: PaymentMethod
  mobile_money_ref?: string
  voucher_id?: string
  payment_status: "pending" | "paid" | "failed" | "refunded"
  amount_paid: number
  tip_amount: number
  change_amount: number
  transaction_id?: string
  card_last_four?: string
  paid_at?: string
  cashier_id?: string
  cashier?: Employee
  notes?: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: string
  tenant_id: string
  supplier_id: string
  supplier?: Supplier
  order_date: string
  expected_delivery?: string
  items: Array<{ item_id: string; quantity: number; unit_cost: number }>
  total_cost: number
  status: "pending" | "ordered" | "received" | "cancelled"
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Shift {
  id: string
  tenant_id: string
  shift_number: string
  employee_id?: string
  employee?: Employee
  start_time: string
  end_time?: string
  opening_balance: number
  closing_balance?: number
  expected_cash?: number
  actual_cash?: number
  cash_difference?: number
  total_sales: number
  total_orders: number
  total_transactions: number
  total_tips: number
  total_discounts: number
  status: "open" | "closed" | "pending_review"
  notes?: string
  created_at: string
  updated_at: string
}

export interface InventoryLog {
  id: string
  tenant_id: string
  menu_item_id?: string
  inventory_item_id?: string
  change_type: "sale" | "purchase" | "waste" | "adjustment" | "transfer" | "production"
  change_amount: number
  previous_stock: number
  new_stock: number
  reason_pt?: string
  reason_en?: string
  cost_impact: number
  reference_id?: string
  reference_type?: string
  employee_id?: string
  employee?: Employee
  created_at: string
  updated_at: string
}

// Default tenant ID for The Spot
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001"
