"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, TrendingUp } from "lucide-react"
import { useTenant } from "@/lib/context/tenant-context"
import { useEmployee } from "@/lib/context/employee-context"
import type { MenuItem } from "@/lib/types/menu"
import { getMenuItemName } from "@/lib/types/menu"

export default function InventoryPage() {
  const { language, tenantId } = useTenant()
  const { permissions } = useEmployee()
  const [lowStockItems, setLowStockItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLowStockItems()
  }, [tenantId])

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch(`/api/inventory/low-stock?tenantId=${tenantId}`)
      const data = await response.json()
      if (data.success) {
        setLowStockItems(data.data)
      }
    } catch (error) {
      console.error("Error fetching low stock items:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!permissions?.canManageInventory) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader subtitle="Inventory Management" />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">You don't have permission to access inventory management.</p>
            </CardContent>
          </Card>
        </main>
        <PageFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader subtitle="Inventory Management" />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Total inventory value</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : lowStockItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No low stock items</p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{getMenuItemName(item, language)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="destructive" className="text-xs">
                          Stock: {item.stock_count}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Threshold: {item.low_stock_threshold}</span>
                      </div>
                    </div>
                    <Button size="sm">Restock</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <PageFooter />
    </div>
  )
}
