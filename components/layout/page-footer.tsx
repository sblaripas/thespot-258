"use client"

import { useLanguage } from "@/lib/i18n/language-context"

export function PageFooter() {
  const { language } = useLanguage()

  return (
    <footer className="mt-12 py-6 text-center text-muted-foreground text-sm border-t border-border">
      <p>
        {language === "en"
          ? "THE SPOT • Mozambique's Premier Entertainment Venue"
          : "THE SPOT • Principal Local de Entretenimento de Moçambique"}
      </p>
      <p className="mt-2">
        {language === "en" ? "© 2025 • Experience Excellence" : "© 2025 • Experimente a Excelência"}
      </p>
    </footer>
  )
}
