import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
}

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const formatCurrency = (amount: number) => `${amount} MT`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-MZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div>
        <p className="font-medium">{transaction.description}</p>
        <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${transaction.transaction_type === "credit" ? "text-green-500" : "text-red-500"}`}>
          {transaction.transaction_type === "credit" ? "+" : "-"}
          {formatCurrency(Math.abs(transaction.amount))}
        </p>
        <Badge variant={transaction.transaction_type === "credit" ? "default" : "secondary"}>
          {transaction.transaction_type}
        </Badge>
      </div>
    </div>
  )
}
