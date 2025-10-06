"use server"

import { createServiceClient } from "@/lib/supabase/server"
import type { ApiResponse } from "@/lib/types/common"

interface CreateOrderParams {
  tableNumber: number
  items: Array<{
    menuItemId: string
    quantity: number
    unitPrice: number
  }>
  totalAmount: number
  notes?: string
}

interface Order {
  id: string
  table_id: string
  status: string
  total_amount: number
  order_type: string
  created_at: string
  notes?: string
  voucher_qr?: string
}

export async function createTableOrder(params: CreateOrderParams): Promise<ApiResponse<Order>> {
  try {
    const supabase = await createServiceClient()

    const { data: table, error: tableError } = await supabase
      .from("tables")
      .select("id")
      .eq("table_number", params.tableNumber)
      .single()

    if (tableError || !table) {
      throw new Error(`Table ${params.tableNumber} not found`)
    }

    const voucherQr = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        table_id: table.id,
        total_amount: params.totalAmount,
        status: "pending",
        order_type: "table", // Changed order_type from "dine_in" to "table" to match database constraint
        notes: params.notes,
        voucher_qr: voucherQr,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = params.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) throw itemsError

    await supabase.from("tables").update({ status: "occupied", current_order_id: order.id }).eq("id", table.id)

    return { data: order, error: null }
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to create order" }
  }
}

export async function confirmOrder(orderId: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const supabase = await createServiceClient()

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("menu_item_id, quantity")
      .eq("order_id", orderId)

    if (itemsError) throw itemsError

    for (const item of orderItems) {
      const { data: menuItem, error: menuError } = await supabase
        .from("menu_items")
        .select("stock_quantity")
        .eq("id", item.menu_item_id)
        .single()

      if (menuError) throw menuError

      const newQuantity = menuItem.stock_quantity - item.quantity

      await supabase
        .from("menu_items")
        .update({
          stock_quantity: newQuantity,
          is_available: newQuantity > 0,
        })
        .eq("id", item.menu_item_id)
    }

    const { error: updateError } = await supabase.from("orders").update({ status: "confirmed" }).eq("id", orderId)

    if (updateError) throw updateError

    return { data: { success: true }, error: null }
  } catch (error) {
    console.error("[v0] Error confirming order:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to confirm order" }
  }
}

export async function getPendingOrders(): Promise<
  ApiResponse<
    Array<{
      id: string
      table_number: number
      total_amount: number
      created_at: string
      items: Array<{ name: string; quantity: number; unit_price: number }>
    }>
  >
> {
  try {
    const supabase = await createServiceClient()

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_amount,
        created_at,
        tables!inner(table_number),
        order_items!inner(
          quantity,
          unit_price,
          menu_items!inner(name)
        )
      `,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (ordersError) throw ordersError

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      table_number: order.tables.table_number,
      total_amount: order.total_amount,
      created_at: order.created_at,
      items: order.order_items.map((item: any) => ({
        name: item.menu_items.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    }))

    return { data: formattedOrders, error: null }
  } catch (error) {
    console.error("[v0] Error fetching pending orders:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch pending orders" }
  }
}
