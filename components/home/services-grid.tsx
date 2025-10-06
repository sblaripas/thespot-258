"use client"

import { useLanguage } from "@/lib/i18n/language-context"

export function ServicesGrid() {
  const { language } = useLanguage()

  const services = [
    {
      title: language === "en" ? "Bar & Lounge" : "Bar e Lounge",
      description:
        language === "en"
          ? "Premium drinks, cocktails, and entertainment"
          : "Bebidas premium, coquetéis e entretenimento",
    },
    {
      title: language === "en" ? "Restaurant" : "Restaurante",
      description:
        language === "en" ? "Delicious food and dining experience" : "Comida deliciosa e experiência gastronômica",
    },
    {
      title: language === "en" ? "Barbershop" : "Barbearia",
      description: language === "en" ? "Professional grooming services" : "Serviços profissionais de cuidados pessoais",
    },
    {
      title: language === "en" ? "Tattoo Studio" : "Estúdio de Tatuagem",
      description: language === "en" ? "Artistic tattoo and body art" : "Tatuagem artística e arte corporal",
    },
    {
      title: language === "en" ? "Spa Services" : "Serviços de Spa",
      description: language === "en" ? "Manicure, pedicure, and massages" : "Manicure, pedicure e massagens",
    },
    {
      title: language === "en" ? "Arts Shop" : "Loja de Arte",
      description: language === "en" ? "Unique art and clothing collection" : "Coleção única de arte e roupas",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {services.map((service) => (
        <div key={service.title} className="text-center">
          <h3 className="text-xl font-playfair font-bold mb-2 text-primary">{service.title}</h3>
          <p className="text-muted-foreground">{service.description}</p>
        </div>
      ))}
    </div>
  )
}
