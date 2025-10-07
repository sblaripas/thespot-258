"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"
import type { InventoryItem, StockAdjustment } from "@/lib/inventory/types"

interface StockAdjustmentsTabProps {
  staffUser: { phone: string; name: string; role: string }
  onUpdate: () => void
}

const adjustmentTypes = [
  { value: "increase", label: "Aumento", icon: TrendingUp, color: "text-green-500" },
  { value: "decrease", label: "Diminuição", icon: TrendingDown, color: "text-red-500" },
  { value: "waste", label: "Desperdício", icon: TrendingDown, color: "text-orange-500" },
  { value: "sale", label: "Venda", icon: TrendingDown, color: "text-blue-500" },
]

const adjustmentReasons = [
  "Recebimento de fornecedor",
  "Danos em evento",
  "Perdas no bar",
  "Venda direta",
  "Ajuste de contagem",
  "Expiração",
  "Outro",
]

export function StockAdjustmentsTab({ staffUser, onUpdate }: StockAdjustmentsTabProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    inventory_item_id: "",
    adjustment_type: "increase",
    quantity: 0,
    reason: "",
    notes: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, adjustmentsRes] = await Promise.all([
        supabase.from("inventory_items").select("*").eq("is_active", true).order("name"),
        supabase
          .from("stock_adjustments")
          .select("*, inventory_item:inventory_items(*)")
          .order("created_at", { ascending: false })
          .limit(50),
      ])

      if (itemsRes.error) throw itemsRes.error
      if (adjustmentsRes.error) throw adjustmentsRes.error

      setItems(itemsRes.data || [])
      setAdjustments(adjustmentsRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.inventory_item_id || formData.quantity <= 0) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    try {
      // Get current stock
      const { data: item, error: itemError } = await supabase
        .from("inventory_items")
        .select("current_stock")
        .eq("id", formData.inventory_item_id)
        .single()

      if (itemError) throw itemError

      const previousStock = item.current_stock
      let newStock = previousStock

      if (formData.adjustment_type === "increase") {
        newStock = previousStock + formData.quantity
      } else {
        newStock = previousStock - formData.quantity
        if (newStock < 0) {
          alert("Stock não pode ser negativo")
          return
        }
      }

      // Create adjustment record
      const { error: adjustmentError } = await supabase.from("stock_adjustments").insert([
        {
          inventory_item_id: formData.inventory_item_id,
          adjustment_type: formData.adjustment_type,
          quantity: formData.quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: formData.reason,
          notes: formData.notes,
          adjusted_by: staffUser.phone,
          reference_type: "manual",
        },
      ])

      if (adjustmentError) throw adjustmentError

      // Update inventory item stock
      const { error: updateError } = await supabase
        .from("inventory_items")
        .update({ current_stock: newStock })
        .eq("id", formData.inventory_item_id)

      if (updateError) throw updateError

      alert("Ajuste registrado com sucesso!")
      setShowDialog(false)
      resetForm()
      fetchData()
      onUpdate()
    } catch (error) {
      console.error("Error creating adjustment:", error)
      alert("Erro ao registrar ajuste")
    }
  }

  const resetForm = () => {
    setFormData({
      inventory_item_id: "",
      adjustment_type: "increase",
      quantity: 0,
      reason: "",
      notes: "",
    })
  }

  if (loading) {
    return <div className="text-center py-8">Carregando ajustes...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ajustes de Stock</CardTitle>
            <Button
              onClick={() => {
                resetForm()
                setShowDialog(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Ajuste
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {adjustments.map((adjustment) => {
              const typeInfo = adjustmentTypes.find((t) => t.value === adjustment.adjustment_type)
              const Icon = typeInfo?.icon || TrendingUp

              return (
                <div key={adjustment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <Icon className={`w-5 h-5 ${typeInfo?.color}`} />
                    <div>
                      <h3 className="font-semibold">{adjustment.inventory_item?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {adjustment.previous_stock} → {adjustment.new_stock} {adjustment.inventory_item?.unit}
                      </p>
                      {adjustment.reason && <p className="text-sm text-muted-foreground">Razão: {adjustment.reason}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={adjustment.adjustment_type === "increase" ? "default" : "destructive"}>
                      {adjustment.adjustment_type === "increase" ? "+" : "-"}
                      {adjustment.quantity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(adjustment.created_at).toLocaleString("pt-PT")}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Adjustment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Ajuste de Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item *</Label>
              <Select
                value={formData.inventory_item_id}
                onValueChange={(value) => setFormData({ ...formData, inventory_item_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Stock: {item.current_stock} {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Ajuste *</Label>
              <Select
                value={formData.adjustment_type}
                onValueChange={(value) => setFormData({ ...formData, adjustment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Razão</Label>
              <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma razão" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Registrar Ajuste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
