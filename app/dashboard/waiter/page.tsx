"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TableIcon, ShoppingCart, TrendingUp, Clock, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface WaiterStats {
  assignedTables: number
  activeOrders: number
  todaySales: number
  todayOrders: number
  averageOrderValue: number
}

interface TableInfo {
  id: string
  table_number: number
  status: string
  current_order_total: number | null
  occupied_since: string | null
}

export default function WaiterDashboard() {
  const [staffUser, setStaffUser] = useState<any>(null)
  const [stats, setStats] = useState<WaiterStats>({
    assignedTables: 0,
    activeOrders: 0,
    todaySales: 0,
    todayOrders: 0,
    averageOrderValue: 0,
  })
  const [myTables, setMyTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const storedUser = localStorage.getItem("staff_user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "waiter") {
        setStaffUser(user)
        loadWaiterData(user.phone)
      } else {
        window.location.href = "/staff"
      }
    } else {
      window.location.href = "/staff"
    }
  }, [])

  async function loadWaiterData(staffPhone: string) {
    try {
      // Get assigned tables
      const { data: tables } = await supabase
        .from("tables")
        .select(`
          id,
          table_number,
          status,
          occupied_since,
          current_order:orders!tables_current_order_id_fkey(total_amount)
        `)
        .eq("assigned_waiter_id", staffPhone)
        .order("table_number")

      const tableData =
        tables?.map((t: any) => ({
          id: t.id,
          table_number: t.table_number,
          status: t.status,
          current_order_total: t.current_order?.total_amount || null,
          occupied_since: t.occupied_since,
        })) || []

      setMyTables(tableData)

      // Get today's orders
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, status")
        .eq("staff_id", staffPhone)
        .gte("created_at", today.toISOString())

      const todayOrders = orders || []
      const completedOrders = todayOrders.filter((o) => o.status === "completed")
      const totalSales = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

      setStats({
        assignedTables: tableData.length,
        activeOrders: tableData.filter((t) => t.status === "occupied").length,
        todaySales: totalSales,
        todayOrders: todayOrders.length,
        averageOrderValue: todayOrders.length > 0 ? totalSales / todayOrders.length : 0,
      })
    } catch (error) {
      console.error("Error loading waiter data:", error)
    } finally {
      setLoading(false)
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
            <Link href="/" className="transition-transform hover:scale-110 duration-300 cursor-pointer">
              <Image src="/the-spot-logo.png" alt="The Spot" width={180} height={60} className="object-contain h-12" />
            </Link>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Waiter Dashboard</h1>
          <p className="text-zinc-400">Welcome, {staffUser?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TableIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.assignedTables}</p>
                  <p className="text-sm text-zinc-400">My Tables</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeOrders}</p>
                  <p className="text-sm text-zinc-400">Active Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todaySales}</p>
                  <p className="text-sm text-zinc-400">Today's Sales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(stats.averageOrderValue)}</p>
                  <p className="text-sm text-zinc-400">Avg Order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/pos">
            <Button className="w-full h-20 text-lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Create Order
            </Button>
          </Link>
          <Link href="/tables">
            <Button variant="outline" className="w-full h-20 text-lg bg-transparent">
              <TableIcon className="mr-2 h-5 w-5" />
              View All Tables
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-20 text-lg bg-transparent">
            <Clock className="mr-2 h-5 w-5" />
            Order History
          </Button>
        </div>

        {/* My Tables */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>My Assigned Tables</CardTitle>
          </CardHeader>
          <CardContent>
            {myTables.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {myTables.map((table) => (
                  <Link key={table.id} href={`/tables/${table.id}`}>
                    <Card className="bg-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-xl font-bold mb-2">Table {table.table_number}</p>
                          <Badge
                            variant={table.status === "free" ? "default" : "secondary"}
                            className={
                              table.status === "free"
                                ? "bg-green-500"
                                : table.status === "occupied"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                            }
                          >
                            {table.status}
                          </Badge>
                          {table.current_order_total && (
                            <p className="text-sm text-zinc-400 mt-2">{table.current_order_total} MZN</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400 py-8">No tables assigned yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
