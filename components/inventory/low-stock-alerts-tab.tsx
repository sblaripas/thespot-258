"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { AlertTriangle, CheckCircle } from "lucide-react"
import type { LowStockAlert } from "@/lib/inventory/types"

interface LowStockAlertsTabProps {
  staffUser: { phone: string; name: string; role: string }
  onUpdate: () => void
}

export function LowStockAlertsTab({ staffUser, onUpdate }: LowStockAlertsTabProps) {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "acknowledged" | "resolved">("active")
  const supabase = createClient()

  useEffect(() => {
    fetchAlerts()
  }, [filter])

  const fetchAlerts = async () => {
    try {
      let query = supabase
        .from("low_stock_alerts")
        .select("*, inventory_item:inventory_items(*)")
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("low_stock_alerts")
        .update({
          status: "acknowledged",
          acknowledged_by: staffUser.phone,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId)

      if (error) throw error

      alert("Alerta reconhecido!")
      fetchAlerts()
      onUpdate()
    } catch (error) {
      console.error("Error acknowledging alert:", error)
      alert("Erro ao reconhecer alerta")
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("low_stock_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId)

      if (error) throw error

      alert("Alerta resolvido!")
      fetchAlerts()
      onUpdate()
    } catch (error) {
      console.error("Error resolving alert:", error)
      alert("Erro ao resolver alerta")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando alertas...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alertas de Stock Baixo</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                Ativos
              </Button>
              <Button
                variant={filter === "acknowledged" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("acknowledged")}
              >
                Reconhecidos
              </Button>
              <Button
                variant={filter === "resolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("resolved")}
              >
                Resolvidos
              </Button>
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                Todos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>Nenhum alerta encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        alert.status === "active"
                          ? "text-red-500"
                          : alert.status === "acknowledged"
                            ? "text-yellow-500"
                            : "text-green-500"
                      }`}
                    />
                    <div>
                      <h3 className="font-semibold">{alert.inventory_item?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Stock atual: {alert.current_stock} {alert.inventory_item?.unit} (Mínimo: {alert.alert_level}{" "}
                        {alert.inventory_item?.unit})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado: {new Date(alert.created_at).toLocaleString("pt-PT")}
                      </p>
                      {alert.acknowledged_at && (
                        <p className="text-xs text-muted-foreground">
                          Reconhecido: {new Date(alert.acknowledged_at).toLocaleString("pt-PT")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        alert.status === "active"
                          ? "destructive"
                          : alert.status === "acknowledged"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {alert.status === "active"
                        ? "Ativo"
                        : alert.status === "acknowledged"
                          ? "Reconhecido"
                          : "Resolvido"}
                    </Badge>
                    {alert.status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert.id)}>
                        Reconhecer
                      </Button>
                    )}
                    {alert.status === "acknowledged" && (
                      <Button size="sm" variant="default" onClick={() => handleResolve(alert.id)}>
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
