"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { FileText } from "lucide-react"
import type { StockAdjustment } from "@/lib/inventory/types"

interface InventoryHistoryTabProps {
  staffUser: { phone: string; name: string; role: string }
}

export function InventoryHistoryTab({ staffUser }: InventoryHistoryTabProps) {
  const [history, setHistory] = useState<StockAdjustment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_adjustments")
        .select("*, inventory_item:inventory_items(*)")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando histórico...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Histórico de Inventário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                <div className="flex-1">
                  <p className="font-medium">{record.inventory_item?.name}</p>
                  <p className="text-muted-foreground">
                    {record.previous_stock} → {record.new_stock} {record.inventory_item?.unit}
                  </p>
                  {record.reason && <p className="text-muted-foreground text-xs">{record.reason}</p>}
                </div>
                <div className="text-right">
                  <Badge variant={record.adjustment_type === "increase" ? "default" : "destructive"}>
                    {record.adjustment_type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(record.created_at).toLocaleString("pt-PT")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
