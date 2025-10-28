import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Payment {
  id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
  order_id: string | null
}

interface PaymentsSectionProps {
  payments: Payment[]
}

export function PaymentsSection({ payments }: PaymentsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Today's Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {payment.amount < 0 ? (
                    <ArrowDownLeft className="w-5 h-5 text-red-500" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${payment.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                    {payment.amount > 0 ? "+" : ""}
                    {payment.amount} MT
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{payment.transaction_type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No payments today</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
