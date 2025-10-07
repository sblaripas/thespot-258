"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface SalesReportsTabProps {
  staffUser: { phone: string; name: string; role: string }
}

export function SalesReportsTab({ staffUser }: SalesReportsTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatórios de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Relatórios de vendas em desenvolvimento</p>
            <p className="text-sm mt-2">
              Em breve: Resumos diários, vendas por item, categoria, funcionário e tipo de pagamento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
