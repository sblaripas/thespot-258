import type { SupabaseClient } from "@supabase/supabase-js"
import type { InventoryChangeType } from "@/lib/types/inventory"

/**
 * Fetch inventory logs for a menu item
 */
export async function fetchInventoryLogs(client: SupabaseClient, menuItemId: string, tenantId: string, limit = 50) {
  return await client
    .from("inventory_logs")
    .select("*, menu_item:menu_items(*), employee:employees(*)")
    .eq("menu_item_id", menuItemId)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit)
}

/**
 * Fetch all inventory logs for a tenant
 */
export async function fetchAllInventoryLogs(client: SupabaseClient, tenantId: string, limit = 100) {
  return await client
    .from("inventory_logs")
    .select("*, menu_item:menu_items(*), employee:employees(*)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit)
}

/**
 * Create manual inventory log entry
 */
export async function createInventoryLog(
  client: SupabaseClient,
  data: {
    tenant_id: string
    menu_item_id: string
    change_type: InventoryChangeType
    change_amount: number
    previous_stock: number
    new_stock: number
    reason_pt?: string
    reason_en?: string
    cost_impact?: number
    reference_id?: string
    employee_id?: string
  },
) {
  return await client.from("inventory_logs").insert(data).select().single()
}

/**
 * Adjust inventory stock with logging
 */
export async function adjustInventoryStock(
  client: SupabaseClient,
  menuItemId: string,
  tenantId: string,
  newStock: number,
  reason_pt: string,
  reason_en: string,
  employeeId?: string,
) {
  // First get current stock
  const { data: item, error: fetchError } = await client
    .from("menu_items")
    .select("stock_count, cost_price")
    .eq("id", menuItemId)
    .eq("tenant_id", tenantId)
    .single()

  if (fetchError || !item) {
    return { data: null, error: fetchError || new Error("Item not found") }
  }

  const changeAmount = newStock - item.stock_count
  const costImpact = changeAmount * item.cost_price

  // Update stock (this will trigger the automatic logging via trigger)
  const { error: updateError } = await client
    .from("menu_items")
    .update({ stock_count: newStock })
    .eq("id", menuItemId)
    .eq("tenant_id", tenantId)

  if (updateError) {
    return { data: null, error: updateError }
  }

  // The trigger will create the log automatically, but we can also create a manual one with more details
  const { data: log, error: logError } = await createInventoryLog(client, {
    tenant_id: tenantId,
    menu_item_id: menuItemId,
    change_type: "adjustment",
    change_amount: changeAmount,
    previous_stock: item.stock_count,
    new_stock: newStock,
    reason_pt,
    reason_en,
    cost_impact: costImpact,
    employee_id: employeeId,
  })

  return { data: log, error: logError }
}

/**
 * Fetch low stock items
 */
export async function fetchLowStockItems(client: SupabaseClient, tenantId: string) {
  return await client.from("low_stock_alerts").select("*").eq("tenant_id", tenantId)
}

/**
 * Record inventory waste
 */
export async function recordInventoryWaste(
  client: SupabaseClient,
  menuItemId: string,
  tenantId: string,
  quantity: number,
  reason_pt: string,
  reason_en: string,
  employeeId?: string,
) {
  const { data: item, error: fetchError } = await client
    .from("menu_items")
    .select("stock_count, cost_price")
    .eq("id", menuItemId)
    .eq("tenant_id", tenantId)
    .single()

  if (fetchError || !item) {
    return { data: null, error: fetchError || new Error("Item not found") }
  }

  const newStock = Math.max(0, item.stock_count - quantity)
  const costImpact = -quantity * item.cost_price

  // Update stock
  const { error: updateError } = await client
    .from("menu_items")
    .update({ stock_count: newStock })
    .eq("id", menuItemId)
    .eq("tenant_id", tenantId)

  if (updateError) {
    return { data: null, error: updateError }
  }

  // Create waste log
  const { data: log, error: logError } = await createInventoryLog(client, {
    tenant_id: tenantId,
    menu_item_id: menuItemId,
    change_type: "waste",
    change_amount: -quantity,
    previous_stock: item.stock_count,
    new_stock: newStock,
    reason_pt,
    reason_en,
    cost_impact: costImpact,
    employee_id: employeeId,
  })

  return { data: log, error: logError }
}
