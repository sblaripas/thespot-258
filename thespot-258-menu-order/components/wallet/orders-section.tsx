import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  menu_item?: {
    name: string
    category: string
  }
}

interface Order {
  id: string
  status: string
  order_type: string
  total_amount: number
  client_confirmed: boolean
  created_at: string
  order_items: OrderItem[]
}

interface OrdersSectionProps {
  orders: Order[]
  title: string
  emptyMessage: string
}

export function OrdersSection({ orders, title, emptyMessage }: OrdersSectionProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />
      case "canceled":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <ShoppingBag className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      canceled: "destructive",
    }
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.menu_item?.name || "Item"}
                      </span>
                      <span className="font-medium">{item.total_price} MT</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">{order.total_amount} MT</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
