"use client"

import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeatureCards } from "@/components/home/feature-cards"
import { ServicesGrid } from "@/components/home/services-grid"
import { EntryInfoCard } from "@/components/home/entry-info-card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <PageHeader subtitle="Digital Experience Hub" />

      <main className="container mx-auto px-4 py-12">
        <HeroSection />
        <FeatureCards />
        <ServicesGrid />
        <EntryInfoCard />
      </main>

      <PageFooter />
    </div>
  )
}
