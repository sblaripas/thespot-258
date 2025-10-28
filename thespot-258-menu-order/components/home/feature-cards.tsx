"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Menu, Users, BarChart3 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export function FeatureCards() {
  const { t, language } = useLanguage()

  const features = [
    {
      icon: QrCode,
      title: language === "en" ? "QR Menu" : "Menu QR",
      description: language === "en" ? "Scan & order instantly" : "Escaneie e peça instantaneamente",
      href: "/menu",
      buttonText: t("menu"),
    },
    {
      icon: Menu,
      title: language === "en" ? "Digital Wallet" : "Carteira Digital",
      description: language === "en" ? "Cashless payments" : "Pagamentos sem dinheiro",
      href: "/wallet",
      buttonText: language === "en" ? "My Wallet" : "Minha Carteira",
    },
    {
      icon: Users,
      title: language === "en" ? "Staff Portal" : "Portal do Pessoal",
      description: language === "en" ? "POS & management" : "POS e gestão",
      href: "/staff",
      buttonText: language === "en" ? "Staff Login" : "Login do Pessoal",
    },
    {
      icon: BarChart3,
      title: language === "en" ? "Admin Dashboard" : "Painel Admin",
      description: language === "en" ? "Analytics & control" : "Análise e controle",
      href: "/admin",
      buttonText: t("dashboard"),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {features.map((feature) => {
        const Icon = feature.icon
        return (
          <Card key={feature.href} className="menu-item bg-card border-border">
            <CardHeader className="text-center">
              <Icon className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={feature.href}>
                <Button className="w-full">{feature.buttonText}</Button>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
