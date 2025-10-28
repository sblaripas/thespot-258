export interface Payment {
  id: string
  tenant_id: string
  order_id: string
  bill_number: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  amount_paid: number
  tip_amount: number
  change_amount: number
  transaction_id: string | null
  card_last_four: string | null
  paid_at: string | null
  cashier_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PaymentMethod = "cash" | "card" | "mobile_money" | "bank_transfer" | "multicaixa"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface PaymentRequest {
  order_id: string
  payment_method: PaymentMethod
  amount_paid: number
  tip_amount?: number
  transaction_id?: string
  card_last_four?: string
  notes?: string
}
