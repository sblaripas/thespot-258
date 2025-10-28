// Payment and Billing Types
import type { Order } from "./orders"
import type { Employee } from "./staff"

export interface Payment {
  id: string
  tenant_id: string
  order_id: string
  order?: Order
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
  cashier?: Employee
  notes: string | null
  created_at: string
  updated_at: string
}

export type PaymentMethod = "cash" | "card" | "mobile_money" | "bank_transfer" | "multicaixa"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
