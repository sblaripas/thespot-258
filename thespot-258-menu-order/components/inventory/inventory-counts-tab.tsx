"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus, ClipboardList } from "lucide-react"
import type { InventoryCount } from "@/lib/inventory/types"

interface InventoryCountsTabProps {
  staffUser: { phone: string; name: string; role: string }
  onUpdate: () => void
}

export function InventoryCountsTab({ staffUser, onUpdate }: InventoryCountsTabProps) {
  const [counts, setCounts] = useState<InventoryCount[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_counts")
        .select("*")
        .order("count_date", { ascending: false })
        .limit(20)

      if (error) throw error
      setCounts(data || [])
    } catch (error) {
      console.error("Error fetching counts:", error)
    } finally {
      setLoading(false)
    }
  }

  const startNewCount = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_counts")
        .insert([
          {
            count_type: "full",
            status: "in_progress",
            counted_by: staffUser.phone,
          },
        ])
        .select()
        .single()

      if (error) throw error

      alert("Nova contagem iniciada!")
      fetchCounts()
      onUpdate()
    } catch (error) {
      console.error("Error starting count:", error)
      alert("Erro ao iniciar contagem")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando contagens...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contagens de Inventário</CardTitle>
            <Button onClick={startNewCount}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Contagem
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {counts.map((count) => (
              <div key={count.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Contagem {count.count_type === "full" ? "Completa" : "Parcial"}</h3>
                    <p className="text-sm text-muted-foreground">
                      Data: {new Date(count.count_date).toLocaleString("pt-PT")}
                    </p>
                    <p className="text-sm text-muted-foreground">Contado por: {count.counted_by}</p>
                    {count.notes && <p className="text-sm text-muted-foreground">Notas: {count.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      count.status === "completed"
                        ? "default"
                        : count.status === "in_progress"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {count.status === "completed"
                      ? "Completo"
                      : count.status === "in_progress"
                        ? "Em Progresso"
                        : "Cancelado"}
                  </Badge>
                  {count.total_variance !== 0 && (
                    <p className="text-sm mt-1">
                      Variação: <strong>{count.total_variance}</strong>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
