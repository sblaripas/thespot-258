"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n/language-context"

export function EntryInfoCard() {
  const { language } = useLanguage()

  return (
    <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-playfair">
          {language === "en" ? "Entry Information" : "Informação de Entrada"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">{language === "en" ? "Before 20:00" : "Antes das 20:00"}</h4>
            <p className="text-muted-foreground">
              {language === "en" ? "Free entry to all services" : "Entrada gratuita para todos os serviços"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">{language === "en" ? "After 20:00" : "Depois das 20:00"}</h4>
            <p className="text-muted-foreground">
              {language === "en"
                ? "500 MZN entry ticket (redeemable for drinks & food)"
                : "Bilhete de entrada de 500 MZN (resgatável por bebidas e comida)"}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            {language === "en"
              ? "Operating Hours: Tue-Thu: 09:00-00:00 | Fri-Sun: 09:00-06:00"
              : "Horário de Funcionamento: Ter-Qui: 09:00-00:00 | Sex-Dom: 09:00-06:00"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
