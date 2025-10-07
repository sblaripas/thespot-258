"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus, Factory } from "lucide-react"
import type { ProductionBatch } from "@/lib/inventory/types"

interface ProductionTabProps {
  staffUser: { phone: string; name: string; role: string }
  onUpdate: () => void
}

export function ProductionTab({ staffUser, onUpdate }: ProductionTabProps) {
  const [batches, setBatches] = useState<ProductionBatch[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from("production_batches")
        .select("*, produced_item:inventory_items(*)")
        .order("production_date", { ascending: false })
        .limit(20)

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error("Error fetching batches:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando produção...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produção</CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Produção
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <Factory className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{batch.produced_item?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {batch.quantity_produced} {batch.produced_item?.unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Data: {new Date(batch.production_date).toLocaleString("pt-PT")}
                    </p>
                    {batch.batch_number && <p className="text-sm text-muted-foreground">Lote: {batch.batch_number}</p>}
                  </div>
                </div>
                <Badge variant={batch.status === "completed" ? "default" : "secondary"}>{batch.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
