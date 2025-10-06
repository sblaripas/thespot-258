"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/language-context"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "en" ? "pt" : "en")} className="gap-2">
      <Globe className="h-4 w-4" />
      {language === "en" ? "PT" : "EN"}
    </Button>
  )
}
