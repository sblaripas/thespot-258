"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PhoneInputFormProps {
  onSubmit: (phone: string) => void
}

export function PhoneInputForm({ onSubmit }: PhoneInputFormProps) {
  const [phone, setPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.trim()) {
      const cleanPhone = phone.replace(/\D/g, "")
      onSubmit(cleanPhone)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, "")
    setPhone(cleaned)
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Access Your Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="843992929"
              maxLength={9}
              inputMode="numeric"
              className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-lg"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Enter 9-digit phone number</p>
          </div>
          <Button type="submit" className="w-full">
            Access Wallet
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
