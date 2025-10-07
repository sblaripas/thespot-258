"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Package, AlertTriangle, TrendingUp, FileText, Settings, BarChart3, ClipboardList, Factory } from "lucide-react"
import { InventoryItemsTab } from "@/components/inventory/inventory-items-tab"
import { StockAdjustmentsTab } from "@/components/inventory/stock-adjustments-tab"
import { LowStockAlertsTab } from "@/components/inventory/low-stock-alerts-tab"
import { InventoryCountsTab } from "@/components/inventory/inventory-counts-tab"
import { ProductionTab } from "@/components/inventory/production-tab"
import { SalesReportsTab } from "@/components/inventory/sales-reports-tab"
import { InventoryHistoryTab } from "@/components/inventory/inventory-history-tab"

interface StaffUser {
  phone: string
  name: string
  role: string
}

export default function InventoryPage() {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    activeAlerts: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const storedUser = localStorage.getItem("staff_user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "admin" || user.role === "barman") {
        setStaffUser(user)
        fetchStats()
      } else {
        alert("Access denied. Only admin and barman can access inventory.")
        window.location.href = "/staff"
      }
    } else {
      window.location.href = "/staff"
    }
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total items
      const { count: totalItems } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      // Fetch low stock items
      const { data: lowStockData } = await supabase
        .from("inventory_items")
        .select("current_stock, min_stock_level")
        .eq("is_active", true)
        .lte("current_stock", supabase.rpc("min_stock_level"))

      // Fetch total inventory value
      const { data: itemsData } = await supabase
        .from("inventory_items")
        .select("current_stock, unit_cost")
        .eq("is_active", true)

      const totalValue = itemsData?.reduce((sum, item) => sum + item.current_stock * item.unit_cost, 0) || 0

      // Fetch active alerts
      const { count: activeAlerts } = await supabase
        .from("low_stock_alerts")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      setStats({
        totalItems: totalItems || 0,
        lowStockItems: lowStockData?.length || 0,
        totalValue: totalValue,
        activeAlerts: activeAlerts || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    )
  }

  if (!staffUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-playfair font-bold text-primary">Gestão de Inventário</h1>
              <p className="text-sm text-muted-foreground">
                Staff: {staffUser.name} ({staffUser.role})
              </p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/staff")}>
              Voltar ao Portal
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Itens ativos no inventário</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Itens abaixo do mínimo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalValue.toFixed(2)} MT</div>
              <p className="text-xs text-muted-foreground">Valor do inventário</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">Alertas pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Itens</span>
            </TabsTrigger>
            <TabsTrigger value="adjustments" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Ajustes</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="counts" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Contagens</span>
            </TabsTrigger>
            <TabsTrigger value="production" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              <span className="hidden sm:inline">Produção</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <InventoryItemsTab staffUser={staffUser} onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="adjustments">
            <StockAdjustmentsTab staffUser={staffUser} onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="alerts">
            <LowStockAlertsTab staffUser={staffUser} onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="counts">
            <InventoryCountsTab staffUser={staffUser} onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="production">
            <ProductionTab staffUser={staffUser} onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="reports">
            <SalesReportsTab staffUser={staffUser} />
          </TabsContent>

          <TabsContent value="history">
            <InventoryHistoryTab staffUser={staffUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
