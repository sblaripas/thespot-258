"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Beer, AlertTriangle, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DrinkOrder {
  id: string
  table_number: number | null
  items: Array<{
    name: string
    quantity: number
    modifiers: any
  }>
  status: string
  created_at: string
}

interface StockAlert {
  id: string
  name: string
  stock_quantity: number
  category: string
}

export default function BartenderDashboard() {
  const [staffUser, setStaffUser] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<DrinkOrder[]>([])
  const [lowStockItems, setLowStockItems] = useState<StockAlert[]>([])
  const [stats, setStats] = useState({
    pendingDrinks: 0,
    lowStockCount: 0,
    todayDrinks: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const storedUser = localStorage.getItem("staff_user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "barman") {
        setStaffUser(user)
        loadBartenderData()
      } else {
        window.location.href = "/staff"
      }
    } else {
      window.location.href = "/staff"
    }
  }, [])

  async function loadBartenderData() {
    try {
      // Get pending drink orders
      const { data: orders } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          created_at,
          table:tables(table_number),
          order_items(
            quantity,
            modifiers,
            menu_item:menu_items(name, category)
          )
        `)
        .in("status", ["pending", "preparing"])
        .order("created_at", { ascending: true })

      const drinkOrders =
        orders
          ?.map((order: any) => {
            const drinkItems = order.order_items?.filter(
              (item: any) =>
                item.menu_item?.category &&
                ["beers", "ciders", "cocktails", "shots", "liqueurs", "bottles"].includes(item.menu_item.category),
            )

            if (drinkItems && drinkItems.length > 0) {
              return {
                id: order.id,
                table_number: order.table?.table_number || null,
                items: drinkItems.map((item: any) => ({
                  name: item.menu_item.name,
                  quantity: item.quantity,
                  modifiers: item.modifiers,
                })),
                status: order.status,
                created_at: order.created_at,
              }
            }
            return null
          })
          .filter(Boolean) || []

      setPendingOrders(drinkOrders)

      // Get low stock items (drinks only)
      const { data: stockItems } = await supabase
        .from("menu_items")
        .select("id, name, stock_quantity, category, min_stock_alert")
        .in("category", ["beers", "ciders", "cocktails", "shots", "liqueurs", "bottles"])
        .lte("stock_quantity", 10)
        .order("stock_quantity", { ascending: true })

      setLowStockItems(stockItems || [])

      // Get today's drink count
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: todayOrders } = await supabase
        .from("order_items")
        .select(`
          quantity,
          menu_item:menu_items(category),
          order:orders(created_at)
        `)
        .gte("order.created_at", today.toISOString())

      const todayDrinkCount =
        todayOrders
          ?.filter(
            (item: any) =>
              item.menu_item?.category &&
              ["beers", "ciders", "cocktails", "shots", "liqueurs", "bottles"].includes(item.menu_item.category),
          )
          .reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

      setStats({
        pendingDrinks: drinkOrders.length,
        lowStockCount: stockItems?.length || 0,
        todayDrinks: todayDrinkCount,
      })
    } catch (error) {
      console.error("Error loading bartender data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function markOrderReady(orderId: string) {
    try {
      await supabase.from("orders").update({ status: "ready" }).eq("id", orderId)
      loadBartenderData()
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/staff">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Image src="/logo.png" alt="The Spot" width={120} height={40} className="object-contain" />
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Bartender Dashboard</h1>
          <p className="text-zinc-400">Welcome, {staffUser?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Beer className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingDrinks}</p>
                  <p className="text-sm text-zinc-400">Pending Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                  <p className="text-sm text-zinc-400">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayDrinks}</p>
                  <p className="text-sm text-zinc-400">Drinks Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders */}
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle>Pending Drink Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length > 0 ? (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id} className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">
                            {order.table_number ? `Table ${order.table_number}` : "Takeout"}
                          </p>
                          <p className="text-sm text-zinc-400">{new Date(order.created_at).toLocaleTimeString()}</p>
                        </div>
                        <Badge variant={order.status === "pending" ? "default" : "secondary"}>{order.status}</Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            {item.modifiers && (
                              <span className="text-blue-400 text-xs">{item.modifiers.modifiers?.join(", ")}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button onClick={() => markOrderReady(order.id)} className="w-full">
                        Mark as Ready
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400 py-8">No pending drink orders</p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-zinc-400">{item.category}</p>
                    </div>
                    <Badge variant="destructive" className="bg-red-500">
                      {item.stock_quantity} left
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400 py-8">All drink stock levels are good</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
