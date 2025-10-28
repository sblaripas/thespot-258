import type { SupabaseClient } from "@supabase/supabase-js"
import type { PaymentMethod, PaymentStatus } from "@/lib/types/payment"

/**
 * Create a new payment
 */
export async function createPayment(
  client: SupabaseClient,
  data: {
    tenant_id: string
    order_id: string
    payment_method: PaymentMethod
    amount_paid: number
    tip_amount?: number
    change_amount?: number
    transaction_id?: string
    card_last_four?: string
    cashier_id?: string
    notes?: string
  },
) {
  const paymentData = {
    ...data,
    payment_status: "paid" as PaymentStatus,
    paid_at: new Date().toISOString(),
  }

  return await client.from("payments").insert(paymentData).select().single()
}

/**
 * Fetch payment by order ID
 */
export async function fetchPaymentByOrderId(client: SupabaseClient, orderId: string, tenantId: string) {
  return await client
    .from("payments")
    .select("*, order:orders(*), cashier:employees(*)")
    .eq("order_id", orderId)
    .eq("tenant_id", tenantId)
    .single()
}

/**
 * Fetch all payments for a tenant
 */
export async function fetchPayments(
  client: SupabaseClient,
  tenantId: string,
  filters?: {
    status?: PaymentStatus
    method?: PaymentMethod
    startDate?: string
    endDate?: string
  },
) {
  let query = client
    .from("payments")
    .select("*, order:orders(*), cashier:employees(*)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  if (filters?.status) {
    query = query.eq("payment_status", filters.status)
  }

  if (filters?.method) {
    query = query.eq("payment_method", filters.method)
  }

  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate)
  }

  return await query
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  client: SupabaseClient,
  paymentId: string,
  tenantId: string,
  status: PaymentStatus,
) {
  return await client.from("payments").update({ payment_status: status }).eq("id", paymentId).eq("tenant_id", tenantId)
}

/**
 * Process refund
 */
export async function processRefund(client: SupabaseClient, paymentId: string, tenantId: string, reason?: string) {
  return await client
    .from("payments")
    .update({
      payment_status: "refunded",
      notes: reason || "Refunded",
    })
    .eq("id", paymentId)
    .eq("tenant_id", tenantId)
}

/**
 * Get payment summary for a date range
 */
export async function getPaymentSummary(client: SupabaseClient, tenantId: string, startDate: string, endDate: string) {
  const { data, error } = await client
    .from("payments")
    .select("payment_method, amount_paid, tip_amount, payment_status")
    .eq("tenant_id", tenantId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)

  if (error || !data) {
    return { data: null, error }
  }

  const summary = {
    total_revenue: 0,
    total_tips: 0,
    total_transactions: data.length,
    by_method: {} as Record<string, number>,
    by_status: {} as Record<string, number>,
  }

  data.forEach((payment) => {
    if (payment.payment_status === "paid") {
      summary.total_revenue += payment.amount_paid
      summary.total_tips += payment.tip_amount || 0
    }

    summary.by_method[payment.payment_method] = (summary.by_method[payment.payment_method] || 0) + payment.amount_paid
    summary.by_status[payment.payment_status] = (summary.by_status[payment.payment_status] || 0) + 1
  })

  return { data: summary, error: null }
}
