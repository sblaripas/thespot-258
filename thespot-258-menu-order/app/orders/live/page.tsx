"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { OrderStatusBadge } from "@/components/order-status-badge"

interface LiveOrder {
  id: string
  status: string
  total_amount: number
  created_at: string
  table_number: number | null
  order_type: string
  item_count: number
}

export default function LiveOrdersPage() {
  const { language } = useLanguage()
  const [orders, setOrders] = useState<LiveOrder[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchLiveOrders()
    subscribeToOrders()
  }, [])

  async function fetchLiveOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          status,
          total_amount,
          created_at,
          order_type,
          table:tables(table_number),
          order_items(quantity)
        `,
        )
        .in("status", ["pending", "preparing", "ready"])
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedOrders = data.map((order: any) => ({
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        table_number: order.table?.table_number || null,
        order_type: order.order_type,
        item_count: order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
      }))

      setOrders(formattedOrders)
    } catch (error) {
      console.error("Error fetching live orders:", error)
    } finally {
      setLoading(false)
    }
  }

  function subscribeToOrders() {
    const channel = supabase
      .channel("live-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchLiveOrders()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">{language === "en" ? "Loading orders..." : "Carregando pedidos..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/staff">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col items-center">
            <Image src="/logo.png" alt="The Spot" width={200} height={80} className="object-contain" />
            <p className="text-zinc-400 mt-1">{language === "en" ? "Live Orders" : "Pedidos ao Vivo"}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {language === "en" ? "Active Orders" : "Pedidos Ativos"} ({orders.length})
          </h1>
          <Button variant="outline" size="sm" onClick={fetchLiveOrders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === "en" ? "Refresh" : "Atualizar"}
          </Button>
        </div>

        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/track?id=${order.id}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>
                        {order.table_number
                          ? `${language === "en" ? "Table" : "Mesa"} ${order.table_number}`
                          : language === "en"
                            ? "Takeout"
                            : "Para Levar"}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{language === "en" ? "Order ID" : "ID do Pedido"}:</span>
                        <span className="font-mono">#{order.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{language === "en" ? "Items" : "Itens"}:</span>
                        <span>{order.item_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{language === "en" ? "Total" : "Total"}:</span>
                        <span className="font-semibold">{order.total_amount} MZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">{language === "en" ? "Time" : "Hora"}:</span>
                        <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-12 text-center">
              <p className="text-zinc-400 text-lg">
                {language === "en" ? "No active orders at the moment" : "Nenhum pedido ativo no momento"}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
