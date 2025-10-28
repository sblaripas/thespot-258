"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface CheckoutModalProps {
  items: Array<{ id: string; name: string; price: number; quantity: number }>
  totalAmount: number
  onClose: () => void
  onConfirm: (tableId: string, notes: string) => Promise<void>
}

export function CheckoutModal({ items, totalAmount, onClose, onConfirm }: CheckoutModalProps) {
  const { language } = useLanguage()
  const [selectedTable, setSelectedTable] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!selectedTable) return

    setLoading(true)
    try {
      await onConfirm(selectedTable, notes)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{language === "en" ? "Complete Your Order" : "Finalizar Pedido"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "en" ? "Select Table" : "Selecionar Mesa"}</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "Choose a table" : "Escolha uma mesa"} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {language === "en" ? `Table ${num}` : `Mesa ${num}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === "en" ? "Special Instructions (Optional)" : "Instruções Especiais (Opcional)"}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === "en" ? "Any special requests..." : "Algum pedido especial..."}
              rows={3}
            />
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{language === "en" ? "Items" : "Itens"}:</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>{language === "en" ? "Total" : "Total"}:</span>
              <span>{totalAmount} MT</span>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleConfirm} disabled={!selectedTable || loading}>
            {loading
              ? language === "en"
                ? "Creating Order..."
                : "Criando Pedido..."
              : language === "en"
                ? "Confirm Order"
                : "Confirmar Pedido"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
