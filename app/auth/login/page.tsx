"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendOTP, verifyOTP } from "./actions"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await sendOTP(phone)

      if (result.success) {
        setStep("otp")
        if (result.otp) {
          setDevOtp(result.otp)
        }
      } else {
        setError(result.error || "Failed to send OTP")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await verifyOTP(phone, otp)

      if (result.success && result.user) {
        // Redirect based on role
        if (result.user.role === "admin") {
          router.push("/admin")
        } else if (result.user.role === "waiter" || result.user.role === "barman") {
          router.push("/staff")
        } else {
          router.push("/")
        }
      } else {
        setError(result.error || "Invalid OTP")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-center text-primary">THE SPOT</h1>
            <p className="text-muted-foreground mt-1">Staff Authentication</p>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login with Phone</CardTitle>
              <CardDescription>
                {step === "phone" ? "Enter your registered phone number" : "Enter your permanent OTP code"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "phone" ? (
                <form onSubmit={handleSendOTP}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+258 84 123 4567"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Checking..." : "Continue"}
                    </Button>
                    {process.env.NODE_ENV === "development" && (
                      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                        <p className="font-semibold mb-1">Test Accounts:</p>
                        <p>Admin: +258840000001 (OTP: 111111)</p>
                        <p>Waiter: +258841000001 (OTP: 333333)</p>
                        <p>Customer: +258843000001 (OTP: 888888)</p>
                      </div>
                    )}
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="otp">OTP Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      {devOtp && (
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          Your OTP: <span className="font-mono font-bold text-foreground">{devOtp}</span>
                        </p>
                      )}
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        setStep("phone")
                        setOtp("")
                        setError(null)
                        setDevOtp(null)
                      }}
                    >
                      Change Phone Number
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
