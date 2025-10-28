"use server"

import { createClient } from "@/lib/supabase/server"

export async function getTablesStatus() {
  const supabase = await createClient()

  const { data: tables, error } = await supabase
    .from("tables")
    .select(`
      *,
      assigned_waiter:users!tables_assigned_waiter_id_fkey(name),
      current_order:orders!tables_current_order_id_fkey(id, total_amount)
    `)
    .order("table_number")

  if (error) {
    console.error("Error fetching tables:", error)
    throw new Error("Failed to fetch tables")
  }

  return tables.map((table: any) => ({
    id: table.id,
    table_number: table.table_number,
    status: table.status,
    assigned_waiter_id: table.assigned_waiter_id,
    waiter_name: table.assigned_waiter?.name || null,
    current_order_id: table.current_order_id,
    order_total: table.current_order?.total_amount || null,
    occupied_since: table.occupied_since,
    qr_code: table.qr_code,
  }))
}

export async function getTableDetails(tableId: string) {
  const supabase = await createClient()

  const { data: table, error } = await supabase
    .from("tables")
    .select(`
      *,
      assigned_waiter:users!tables_assigned_waiter_id_fkey(id, name, phone),
      current_order:orders!tables_current_order_id_fkey(
        id,
        total_amount,
        status,
        created_at,
        order_items(
          id,
          quantity,
          unit_price,
          total_price,
          modifiers,
          menu_item:menu_items(name, category)
        )
      )
    `)
    .eq("id", tableId)
    .single()

  if (error) {
    console.error("Error fetching table details:", error)
    throw new Error("Failed to fetch table details")
  }

  return table
}

export async function assignWaiterToTable(tableId: string, waiterId: string, assignedBy: string) {
  const supabase = await createClient()

  // Update table
  const { error: tableError } = await supabase
    .from("tables")
    .update({
      assigned_waiter_id: waiterId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tableId)

  if (tableError) {
    console.error("Error assigning waiter:", tableError)
    throw new Error("Failed to assign waiter")
  }

  // Log assignment
  const { error: assignmentError } = await supabase.from("table_assignments").insert({
    table_id: tableId,
    waiter_id: waiterId,
    assigned_by: assignedBy,
  })

  if (assignmentError) {
    console.error("Error logging assignment:", assignmentError)
  }

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: assignedBy,
    action: "assign_waiter",
    entity_type: "table",
    entity_id: tableId,
    details: { waiter_id: waiterId },
  })

  return { success: true }
}

export async function updateTableStatus(tableId: string, status: "free" | "occupied" | "reserved", userId: string) {
  const supabase = await createClient()

  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "occupied") {
    updates.occupied_since = new Date().toISOString()
  } else if (status === "free") {
    updates.occupied_since = null
    updates.current_order_id = null
  }

  const { error } = await supabase.from("tables").update(updates).eq("id", tableId)

  if (error) {
    console.error("Error updating table status:", error)
    throw new Error("Failed to update table status")
  }

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: userId,
    action: "update_table_status",
    entity_type: "table",
    entity_id: tableId,
    details: { status },
  })

  return { success: true }
}
