"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { QrCode, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface Voucher {
  id: string
  qr_code: string
  amount: number
  status: string
  client_phone: string | null
  issued_at: string
  created_at: string
}

function ScanContent() {
  const [voucher, setVoucher] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const voucherId = searchParams.get("voucher")
  const qrCode = searchParams.get("qr")

  useEffect(() => {
    if (voucherId || qrCode) {
      fetchVoucher()
    } else {
      setError("Invalid QR code")
      setLoading(false)
    }
  }, [voucherId, qrCode])

  const fetchVoucher = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from("vouchers").select("*")

      if (voucherId) {
        query = query.eq("id", voucherId)
      } else if (qrCode) {
        query = query.eq("qr_code", qrCode)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === "PGRST116") {
          setError("Voucher not found")
        } else {
          throw error
        }
        return
      }

      setVoucher(data)
    } catch (error) {
      console.error("Error fetching voucher:", error)
      setError("Failed to load voucher")
    } finally {
      setLoading(false)
    }
  }

  const activateVoucher = async () => {
    if (!voucher) return

    try {
      setActivating(true)
      setError(null)

      // Check if voucher is already used
      if (voucher.status === "voided" || voucher.status === "used") {
        setError("This voucher has already been used")
        return
      }

      // Get phone number from user
      const phone = prompt("Please enter your phone number:")
      if (!phone) {
        setError("Phone number is required")
        return
      }

      // Create or update wallet
      const { data: existingWallet } = await supabase.from("wallets").select("*").eq("client_phone", phone).single()

      let walletId: string

      if (existingWallet) {
        // Update existing wallet
        const { data: updatedWallet, error: updateError } = await supabase
          .from("wallets")
          .update({
            balance: existingWallet.balance + voucher.amount,
            activated_at: new Date().toISOString(),
            voucher_id: voucher.id,
          })
          .eq("id", existingWallet.id)
          .select()
          .single()

        if (updateError) throw updateError
        walletId = updatedWallet.id
      } else {
        // Create new wallet
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            client_phone: phone,
            balance: voucher.amount,
            activated_at: new Date().toISOString(),
            voucher_id: voucher.id,
          })
          .select()
          .single()

        if (createError) throw createError
        walletId = newWallet.id
      }

      // Update voucher status
      await supabase
        .from("vouchers")
        .update({
          status: "used",
          client_phone: phone,
        })
        .eq("id", voucher.id)

      // Create transaction record
      await supabase.from("transactions").insert({
        wallet_id: walletId,
        amount: voucher.amount,
        transaction_type: "credit",
        description: `Voucher activation - ${voucher.amount} MT`,
      })

      // Store phone in localStorage for wallet access
      localStorage.setItem("client_phone", phone)

      setSuccess(true)

      // Redirect to wallet after 3 seconds
      setTimeout(() => {
        router.push("/wallet")
      }, 3000)
    } catch (error) {
      console.error("Error activating voucher:", error)
      setError("Failed to activate voucher")
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading voucher...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-center text-primary">THE SPOT</h1>
            <p className="text-muted-foreground mt-1">Voucher Activation</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              <QrCode className="w-6 h-6" />
              Voucher Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center space-y-4">
                <XCircle className="w-16 h-16 text-destructive mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-destructive">Error</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Go Home
                </Button>
              </div>
            ) : success ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-green-500">Success!</h3>
                  <p className="text-muted-foreground">Your wallet has been activated with {voucher?.amount} MT</p>
                  <p className="text-sm text-muted-foreground mt-2">Redirecting to wallet...</p>
                </div>
              </div>
            ) : voucher ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{voucher.amount} MT</div>
                  <p className="text-muted-foreground">Voucher Value</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`font-semibold ${
                        voucher.status === "active"
                          ? "text-green-500"
                          : voucher.status === "used"
                            ? "text-red-500"
                            : "text-yellow-500"
                      }`}
                    >
                      {voucher.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issued:</span>
                    <span>{new Date(voucher.issued_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {voucher.status === "active" ? (
                  <Button className="w-full" onClick={activateVoucher} disabled={activating}>
                    {activating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      "Activate Voucher"
                    )}
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">This voucher has already been {voucher.status}</p>
                    <Button variant="outline" onClick={() => router.push("/")}>
                      Go Home
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  )
}
