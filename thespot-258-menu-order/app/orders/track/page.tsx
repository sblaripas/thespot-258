"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ChefHat, Package, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  table_number: number | null
  order_items: Array<{
    quantity: number
    unit_price: number
    menu_item: {
      name: string
      category: string
    }
    modifiers: any
  }>
}

const statusSteps = [
  { key: "pending", icon: Clock, label: { en: "Order Received", pt: "Pedido Recebido" } },
  { key: "preparing", icon: ChefHat, label: { en: "Preparing", pt: "Preparando" } },
  { key: "ready", icon: Package, label: { en: "Ready", pt: "Pronto" } },
  { key: "completed", icon: CheckCircle, label: { en: "Completed", pt: "Concluído" } },
]

export default function OrderTrackingPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const { language } = useLanguage()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!orderId) {
      setError(language === "en" ? "No order ID provided" : "ID do pedido não fornecido")
      setLoading(false)
      return
    }

    fetchOrder()
    subscribeToOrderUpdates()
  }, [orderId])

  async function fetchOrder() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          status,
          total_amount,
          created_at,
          table:tables(table_number),
          order_items(
            quantity,
            unit_price,
            modifiers,
            menu_item:menu_items(name, category)
          )
        `,
        )
        .eq("id", orderId)
        .single()

      if (error) throw error

      setOrder({
        ...data,
        table_number: data.table?.table_number || null,
      })
    } catch (err) {
      console.error("Error fetching order:", err)
      setError(language === "en" ? "Order not found" : "Pedido não encontrado")
    } finally {
      setLoading(false)
    }
  }

  function subscribeToOrderUpdates() {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, status: payload.new.status } : null))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getCurrentStepIndex = () => {
    if (!order) return 0
    return statusSteps.findIndex((step) => step.key === order.status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">{language === "en" ? "Loading order..." : "Carregando pedido..."}</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStep = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-end mb-2">
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col items-center">
            <Image src="/logo.png" alt="The Spot" width={200} height={80} className="object-contain" />
            <p className="text-zinc-400 mt-1">{language === "en" ? "Order Tracking" : "Rastreamento de Pedido"}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Order Info */}
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {language === "en" ? "Order" : "Pedido"} #{order.id.slice(0, 8)}
              </span>
              <Badge
                variant={order.status === "completed" ? "default" : "secondary"}
                className={
                  order.status === "completed"
                    ? "bg-green-500"
                    : order.status === "cancelled"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }
              >
                {order.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {order.table_number && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">{language === "en" ? "Table" : "Mesa"}:</span>
                  <span className="font-semibold">{order.table_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">{language === "en" ? "Time" : "Hora"}:</span>
                <span className="font-semibold">{new Date(order.created_at).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">{language === "en" ? "Total" : "Total"}:</span>
                <span className="font-semibold text-lg">{order.total_amount} MZN</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle>{language === "en" ? "Order Status" : "Estado do Pedido"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index <= currentStep
                const isCurrent = index === currentStep
                const isCancelled = order.status === "cancelled"

                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                        isCancelled
                          ? "border-red-500 bg-red-500/10"
                          : isCompleted
                            ? "border-green-500 bg-green-500/10"
                            : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <StepIcon
                        className={`w-6 h-6 ${
                          isCancelled ? "text-red-500" : isCompleted ? "text-green-500" : "text-zinc-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          isCancelled ? "text-red-500" : isCompleted ? "text-white" : "text-zinc-500"
                        }`}
                      >
                        {step.label[language]}
                      </p>
                      {isCurrent && !isCancelled && (
                        <p className="text-sm text-yellow-500">
                          {language === "en" ? "In progress..." : "Em andamento..."}
                        </p>
                      )}
                    </div>
                    {isCompleted && !isCancelled && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>{language === "en" ? "Order Items" : "Itens do Pedido"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{item.menu_item.name}</p>
                    <p className="text-sm text-zinc-400">
                      {item.quantity} x {item.unit_price} MZN
                    </p>
                    {item.modifiers?.modifiers && item.modifiers.modifiers.length > 0 && (
                      <p className="text-xs text-blue-400 mt-1">{item.modifiers.modifiers.join(", ")}</p>
                    )}
                    {item.modifiers?.notes && (
                      <p className="text-xs text-orange-400 mt-1">
                        {language === "en" ? "Note" : "Nota"}: {item.modifiers.notes}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">{item.quantity * item.unit_price} MZN</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
