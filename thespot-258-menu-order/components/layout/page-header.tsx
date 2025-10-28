"use client"

import Link from "next/link"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/i18n/language-context"

interface PageHeaderProps {
  subtitle?: string
  showLanguageSwitcher?: boolean
}

export function PageHeader({ subtitle, showLanguageSwitcher = true }: PageHeaderProps) {
  const { language } = useLanguage()

  return (
    <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
      <div className="container mx-auto px-4 py-4">
        {showLanguageSwitcher && (
          <div className="flex justify-end mb-2">
            <LanguageSwitcher />
          </div>
        )}
        <div className="flex flex-col items-center">
          <Link href="/" className="transition-transform hover:scale-110 duration-300 cursor-pointer">
            <Image
              src="/the-spot-logo.png"
              alt="The Spot Logo"
              width={400}
              height={160}
              className="h-24 w-auto"
              priority
            />
          </Link>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}
