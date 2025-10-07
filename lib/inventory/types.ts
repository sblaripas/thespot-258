export interface InventoryItem {
  id: string
  name: string
  description: string | null
  category: string
  unit: string
  current_stock: number
  min_stock_level: number
  max_stock_level: number | null
  unit_cost: number
  supplier: string | null
  barcode: string | null
  sku: string | null
  is_composite: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ItemComponent {
  id: string
  parent_item_id: string
  component_item_id: string
  quantity_required: number
  created_at: string
  component?: InventoryItem
}

export interface StockAdjustment {
  id: string
  inventory_item_id: string
  adjustment_type: "increase" | "decrease" | "sale" | "waste" | "production" | "count"
  quantity: number
  previous_stock: number
  new_stock: number
  reason: string | null
  notes: string | null
  reference_id: string | null
  reference_type: string | null
  adjusted_by: string
  created_at: string
  inventory_item?: InventoryItem
}

export interface InventoryCount {
  id: string
  count_date: string
  count_type: "full" | "partial"
  status: "in_progress" | "completed" | "cancelled"
  counted_by: string
  notes: string | null
  total_variance: number
  completed_at: string | null
  created_at: string
}

export interface InventoryCountItem {
  id: string
  count_id: string
  inventory_item_id: string
  expected_quantity: number
  counted_quantity: number | null
  variance: number | null
  notes: string | null
  created_at: string
  inventory_item?: InventoryItem
}

export interface ProductionBatch {
  id: string
  produced_item_id: string
  quantity_produced: number
  production_date: string
  produced_by: string
  batch_number: string | null
  expiry_date: string | null
  notes: string | null
  status: "completed" | "in_progress" | "cancelled"
  created_at: string
  produced_item?: InventoryItem
}

export interface LowStockAlert {
  id: string
  inventory_item_id: string
  alert_level: number
  current_stock: number
  status: "active" | "acknowledged" | "resolved"
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  created_at: string
  inventory_item?: InventoryItem
}

export interface Discount {
  id: string
  order_id: string | null
  order_item_id: string | null
  discount_type: "percentage" | "fixed_amount" | "voucher"
  discount_value: number
  discount_amount: number
  reason: string | null
  approved_by: string | null
  applied_by: string
  created_at: string
}

export interface SalesSummary {
  total_revenue: number
  total_orders: number
  total_items_sold: number
  average_order_value: number
  period_start: string
  period_end: string
}

export interface SalesByItem {
  item_id: string
  item_name: string
  quantity_sold: number
  total_revenue: number
  category: string
}

export interface SalesByCategory {
  category: string
  quantity_sold: number
  total_revenue: number
  item_count: number
}

export interface SalesByEmployee {
  staff_id: string
  staff_name: string
  total_orders: number
  total_revenue: number
  total_items_sold: number
}

export interface SalesByPaymentType {
  payment_type: string
  total_transactions: number
  total_amount: number
}
