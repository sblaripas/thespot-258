"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PaymentMethod } from "@/lib/types/payment"
import { CreditCard, Banknote, Smartphone, Building } from "lucide-react"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  orderId: string
  totalAmount: number
  onPaymentComplete: () => void
}

export function PaymentModal({ open, onClose, orderId, totalAmount, onPaymentComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [amountPaid, setAmountPaid] = useState(totalAmount.toString())
  const [tipAmount, setTipAmount] = useState("0")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          payment_method: paymentMethod,
          amount_paid: Number.parseFloat(amountPaid),
          tip_amount: Number.parseFloat(tipAmount),
        }),
      })

      if (response.ok) {
        onPaymentComplete()
        onClose()
      }
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setLoading(false)
    }
  }

  const changeAmount = Math.max(0, Number.parseFloat(amountPaid) - totalAmount)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>Total Amount: {totalAmount.toFixed(2)} MT</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                  <Banknote className="w-4 h-4" />
                  Cash
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="w-4 h-4" />
                  Card
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile_money" id="mobile" />
                <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer">
                  <Smartphone className="w-4 h-4" />
                  Mobile Money
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multicaixa" id="multicaixa" />
                <Label htmlFor="multicaixa" className="flex items-center gap-2 cursor-pointer">
                  <Building className="w-4 h-4" />
                  Multicaixa
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Paid</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tip">Tip Amount (Optional)</Label>
            <Input
              id="tip"
              type="number"
              step="0.01"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
            />
          </div>

          {paymentMethod === "cash" && changeAmount > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Change: {changeAmount.toFixed(2)} MT</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
