"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, TableIcon, DollarSign, TrendingUp, Clock, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ManagerDashboard() {
  const [staffUser, setStaffUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalTables: 12,
    occupiedTables: 0,
    activeOrders: 0,
    todaySales: 0,
    todayOrders: 0,
    averageOrderValue: 0,
    activeStaff: 0,
    lowStockItems: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const storedUser = localStorage.getItem("staff_user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "admin") {
        setStaffUser(user)
        loadManagerData()
      } else {
        window.location.href = "/staff"
      }
    } else {
      window.location.href = "/staff"
    }
  }, [])

  async function loadManagerData() {
    try {
      // Get table stats
      const { data: tables } = await supabase.from("tables").select("status")

      const occupiedCount = tables?.filter((t) => t.status === "occupied").length || 0

      // Get today's orders
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, status")
        .gte("created_at", today.toISOString())

      const todayOrders = orders || []
      const completedOrders = todayOrders.filter((o) => o.status === "completed")
      const totalSales = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      const activeOrders = todayOrders.filter((o) => ["pending", "preparing", "ready"].includes(o.status)).length

      // Get low stock count
      const { data: lowStock } = await supabase.from("menu_items").select("id").lte("stock_quantity", 10)

      setStats({
        totalTables: 12,
        occupiedTables: occupiedCount,
        activeOrders,
        todaySales: totalSales,
        todayOrders: todayOrders.length,
        averageOrderValue: todayOrders.length > 0 ? totalSales / todayOrders.length : 0,
        activeStaff: 12, // Placeholder
        lowStockItems: lowStock?.length || 0,
      })
    } catch (error) {
      console.error("Error loading manager data:", error)
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
            <Image src="/logo.png" alt="The Spot" width={120} height={40} className="object-contain" />
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Manager Dashboard</h1>
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
                  <p className="text-2xl font-bold">
                    {stats.occupiedTables}/{stats.totalTables}
                  </p>
                  <p className="text-sm text-zinc-400">Tables Occupied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
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

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeStaff}</p>
                  <p className="text-sm text-zinc-400">Active Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Package className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lowStockItems}</p>
                  <p className="text-sm text-zinc-400">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayOrders}</p>
                  <p className="text-sm text-zinc-400">Orders Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/tables">
            <Button className="w-full h-20 text-lg">
              <TableIcon className="mr-2 h-5 w-5" />
              Manage Tables
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="w-full h-20 text-lg bg-transparent">
              <Users className="mr-2 h-5 w-5" />
              Staff Management
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-20 text-lg bg-transparent">
            <TrendingUp className="mr-2 h-5 w-5" />
            View Reports
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span>Table Occupancy Rate</span>
                <span className="font-bold">{Math.round((stats.occupiedTables / stats.totalTables) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span>Order Completion Rate</span>
                <span className="font-bold">
                  {stats.todayOrders > 0
                    ? Math.round(((stats.todayOrders - stats.activeOrders) / stats.todayOrders) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <span>Stock Status</span>
                <span className={`font-bold ${stats.lowStockItems > 5 ? "text-red-500" : "text-green-500"}`}>
                  {stats.lowStockItems > 5 ? "Needs Attention" : "Good"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
