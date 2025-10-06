"use client"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n/language-context"

interface OrderStatusBadgeProps {
  status: string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { language } = useLanguage()

  const statusConfig: Record<string, { label: { en: string; pt: string }; variant: string; className: string }> = {
    pending: {
      label: { en: "Pending", pt: "Pendente" },
      variant: "secondary",
      className: "bg-yellow-500",
    },
    pending_confirmation: {
      label: { en: "Awaiting Confirmation", pt: "Aguardando Confirmação" },
      variant: "secondary",
      className: "bg-orange-500",
    },
    preparing: {
      label: { en: "Preparing", pt: "Preparando" },
      variant: "secondary",
      className: "bg-blue-500",
    },
    ready: {
      label: { en: "Ready", pt: "Pronto" },
      variant: "secondary",
      className: "bg-purple-500",
    },
    completed: {
      label: { en: "Completed", pt: "Concluído" },
      variant: "default",
      className: "bg-green-500",
    },
    cancelled: {
      label: { en: "Cancelled", pt: "Cancelado" },
      variant: "destructive",
      className: "bg-red-500",
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge variant={config.variant as any} className={config.className}>
      {config.label[language]}
    </Badge>
  )
}
