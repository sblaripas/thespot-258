"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface QRCodeCardProps {
  walletId: string
  phone: string
}

export function QRCodeCard({ walletId, phone }: QRCodeCardProps) {
  const [showQR, setShowQR] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-6 h-6" />
          My QR Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {showQR ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG
                  value={`${window.location.origin}/scan?wallet=${walletId}&phone=${phone}`}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-muted-foreground">Show this QR code to staff for payments</p>
              <Button variant="outline" onClick={() => setShowQR(false)}>
                Hide QR Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">Generate your QR code for payments</p>
              <Button onClick={() => setShowQR(true)}>Show QR Code</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
