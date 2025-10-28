"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus } from "lucide-react"
import { useTenant } from "@/lib/context/tenant-context"
import { useTranslation } from "@/lib/hooks/use-translation"
import type { MenuItem } from "@/lib/types/menu"
import { getMenuItemName, getMenuItemDescription } from "@/lib/types/menu"

interface MenuItemCardProps {
  item: MenuItem
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  const { language } = useTenant()
  const { t } = useTranslation()

  const itemName = getMenuItemName(item, language)
  const itemDescription = getMenuItemDescription(item, language)

  const displayPrice = item.price || 0
  const stockQuantity = item.stock_quantity || 0
  const minStockAlert = item.min_stock_alert || 5
  const isLowStock = stockQuantity <= minStockAlert && stockQuantity > 0
  const isOutOfStock = stockQuantity === 0

  return (
    <Card className="menu-item bg-card border-border">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{itemName}</h3>
            {itemDescription && <p className="text-sm text-muted-foreground mt-1">{itemDescription}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="price-tag px-3 py-1 rounded-full text-sm font-bold text-primary-foreground">
                {displayPrice.toFixed(2)} MT
              </span>
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  {t("lowStock")}
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="destructive" className="text-xs">
                  {t("outOfStock")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {t("stockCount")}: {stockQuantity}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onRemove}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-semibold min-w-[2rem] text-center">{quantity}</span>
              <Button size="sm" variant="outline" onClick={onAdd} disabled={isOutOfStock || quantity >= stockQuantity}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={onAdd} disabled={isOutOfStock}>
              {t("addToCart")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
