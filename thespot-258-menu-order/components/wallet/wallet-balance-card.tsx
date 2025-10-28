"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, RefreshCw } from "lucide-react"

interface WalletBalanceCardProps {
  balance: number
  phone: string
  isActivated: boolean
  onRefresh: () => void
}

export function WalletBalanceCard({ balance, phone, isActivated, onRefresh }: WalletBalanceCardProps) {
  return (
    <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            My Wallet
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">{balance} MT</div>
          <p className="text-muted-foreground">Available Balance</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant={isActivated ? "default" : "secondary"}>{isActivated ? "Active" : "Inactive"}</Badge>
            <span className="text-sm text-muted-foreground">{phone}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
