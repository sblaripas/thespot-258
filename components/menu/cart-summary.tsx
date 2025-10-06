"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartSummaryProps {
  items: CartItem[]
  onCheckout: () => void
}

export function CartSummary({ items, onCheckout }: CartSummaryProps) {
  const { t, language } = useLanguage()

  const getTotalPrice = () => items.reduce((total, item) => total + item.price * item.quantity, 0)
  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0)

  if (items.length === 0) return null

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border-border shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          {t("cart")} ({getTotalItems()} {language === "en" ? "items" : "itens"})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>{item.price * item.quantity} MT</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-2 mb-4">
          <div className="flex justify-between items-center font-semibold">
            <span>{t("total")}:</span>
            <span>{getTotalPrice()} MT</span>
          </div>
        </div>
        <Button className="w-full" size="lg" onClick={onCheckout}>
          {language === "en" ? "Proceed to Checkout" : "Finalizar Pedido"}
        </Button>
      </CardContent>
    </Card>
  )
}
