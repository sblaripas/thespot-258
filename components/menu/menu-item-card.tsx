"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  is_available: boolean
  stock_quantity: number
}

interface MenuItemCardProps {
  item: MenuItem
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  const { t, language } = useLanguage()

  return (
    <Card className="menu-item bg-card border-border">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="price-tag px-3 py-1 rounded-full text-sm font-bold text-primary-foreground">
                {item.price} MT
              </span>
              {item.stock_quantity <= 5 && (
                <Badge variant="destructive" className="text-xs">
                  {language === "en" ? "Low Stock" : "Estoque Baixo"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {language === "en" ? "Stock" : "Estoque"}: {item.stock_quantity}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onRemove}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-semibold min-w-[2rem] text-center">{quantity}</span>
              <Button size="sm" variant="outline" onClick={onAdd} disabled={quantity >= item.stock_quantity}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={onAdd} disabled={item.stock_quantity === 0}>
              {t("addToCart")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
