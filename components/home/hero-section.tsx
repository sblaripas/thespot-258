"use client"

import { useLanguage } from "@/lib/i18n/language-context"

export function HeroSection() {
  const { language } = useLanguage()

  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
        {language === "en" ? "Welcome to The Future of Hospitality" : "Bem-vindo ao Futuro da Hospitalidade"}
      </h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {language === "en"
          ? "Experience seamless ordering, digital payments, and premium service at Mozambique's premier entertainment venue."
          : "Experimente pedidos sem complicações, pagamentos digitais e serviço premium no principal local de entretenimento de Moçambique."}
      </p>
    </div>
  )
}
