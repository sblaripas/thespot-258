"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPendingOrders, confirmOrder } from "@/lib/db/queries/orders"
import { useLanguage } from "@/lib/i18n/language-context"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Clock } from "lucide-react"

export default function WaiterOrdersPage() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await getPendingOrders()
    if (!error && data) {
      setOrders(data)
    }
    setLoading(false)
  }

  const handleConfirm = async (orderId: string) => {
    setConfirmingId(orderId)
    const { error } = await confirmOrder(orderId)

    if (error) {
      toast({
        title: language === "en" ? "Error" : "Erro",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: language === "en" ? "Order Confirmed" : "Pedido Confirmado",
        description: language === "en" ? "Inventory has been updated" : "Inventário foi atualizado",
      })
      fetchOrders()
    }
    setConfirmingId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{language === "en" ? "Loading..." : "Carregando..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <PageHeader subtitle={language === "en" ? "Pending Orders" : "Pedidos Pendentes"} />

      <main className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">
                {language === "en" ? "No pending orders" : "Nenhum pedido pendente"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {language === "en" ? "Table" : "Mesa"} {order.table_number}
                      <Badge variant="secondary">{language === "en" ? "Pending" : "Pendente"}</Badge>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span>{item.unit_price * item.quantity} MT</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <span className="font-semibold text-lg">
                      {language === "en" ? "Total" : "Total"}: {order.total_amount} MT
                    </span>
                    <Button
                      onClick={() => handleConfirm(order.id)}
                      disabled={confirmingId === order.id}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {confirmingId === order.id
                        ? language === "en"
                          ? "Confirming..."
                          : "Confirmando..."
                        : language === "en"
                          ? "Confirm Order"
                          : "Confirmar Pedido"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
