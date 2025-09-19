"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { QrCode, Plus, Users, LogOut } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useRouter } from "next/navigation"

interface StaffUser {
  phone: string
  name: string
  role: string
  otp: string
}

const staffUsers: StaffUser[] = [
  // Tellers
  { phone: "8212345678", name: "Ana", role: "teller", otp: "123456" },
  { phone: "8412345678", name: "Joana", role: "teller", otp: "123456" },
  { phone: "8712345678", name: "Maria", role: "teller", otp: "123456" },
  // Bar/Waiters
  { phone: "8222345678", name: "Hyuta", role: "barman", otp: "223456" },
  { phone: "8422345678", name: "Keny", role: "waiter", otp: "223456" },
  { phone: "8722345678", name: "Tiago", role: "waiter", otp: "223456" },
  // Admins
  { phone: "8232345678", name: "Yanick", role: "admin", otp: "323456" },
  { phone: "8432345678", name: "Dany", role: "admin", otp: "323456" },
  { phone: "8732345678", name: "Laripas", role: "admin", otp: "323456" },
]

export default function StaffPage() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<StaffUser | null>(null)
  const [generatedVoucher, setGeneratedVoucher] = useState<{ id: string; qr_code: string; amount: number } | null>(null)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check for stored staff user
      const storedUser = localStorage.getItem("staff_user")
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser))
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const user = staffUsers.find((u) => u.phone === phone && u.otp === otp)
    if (user) {
      setLoggedInUser(user)
      localStorage.setItem("staff_user", JSON.stringify(user))
    } else {
      setError("Invalid phone number or OTP")
    }
  }

  const generateVoucher = async () => {
    if (!loggedInUser || loggedInUser.role !== "teller") return

    try {
      setGenerating(true)
      setError(null)

      const voucherId = crypto.randomUUID()
      const qrCode = `SPOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { data, error } = await supabase
        .from("vouchers")
        .insert({
          id: voucherId,
          qr_code: qrCode,
          amount: 500,
          status: "active",
          issued_by: loggedInUser.phone,
          issued_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setGeneratedVoucher({
        id: data.id,
        qr_code: data.qr_code,
        amount: data.amount,
      })
    } catch (error) {
      console.error("Error generating voucher:", error)
      setError("Failed to generate voucher")
    } finally {
      setGenerating(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setLoggedInUser(null)
    setGeneratedVoucher(null)
    setPhone("")
    setOtp("")
    localStorage.removeItem("staff_user")
    router.push("/auth/login")
  }

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card">
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col items-center">
              <Image src="/the-spot-logo.png" alt="The Spot Logo" width={250} height={100} className="h-12 w-auto" />
              <p className="text-muted-foreground mt-1">Staff Portal</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center flex items-center gap-2 justify-center">
                <Users className="w-6 h-6" />
                Staff Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="84xxxxxxx"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    type="password"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/the-spot-logo.png" alt="The Spot Logo" width={200} height={80} className="h-10 w-auto" />
              <div>
                <p className="text-muted-foreground">Welcome, {loggedInUser.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role-specific actions */}
          {loggedInUser.role === "teller" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-6 h-6" />
                  Generate Entry Voucher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">500 MT</div>
                    <p className="text-muted-foreground">Entry Voucher Value</p>
                  </div>

                  {generatedVoucher ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <QRCodeSVG
                          value={`${window.location.origin}/scan?qr=${generatedVoucher.qr_code}`}
                          size={200}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Voucher ID: {generatedVoucher.id.slice(0, 8)}...
                        </p>
                        <Button variant="outline" onClick={() => setGeneratedVoucher(null)}>
                          Generate New Voucher
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={generateVoucher} disabled={generating}>
                      {generating ? (
                        <>
                          <Plus className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Generate Voucher
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Common staff actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(loggedInUser.role === "barman" ||
                  loggedInUser.role === "waiter" ||
                  loggedInUser.role === "admin") && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => (window.location.href = "/pos")}
                  >
                    POS System
                  </Button>
                )}
                {loggedInUser.role === "admin" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => (window.location.href = "/admin")}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  View Orders
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Menu Management
                </Button>
                {loggedInUser.role === "admin" && (
                  <>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      User Management
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="mt-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
