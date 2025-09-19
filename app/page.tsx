import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Menu, Users, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center">
            <Image
              src="/the-spot-logo.png"
              alt="The Spot Logo"
              width={300}
              height={120}
              className="h-16 w-auto"
              priority
            />
            <p className="text-muted-foreground mt-1">Digital Experience Hub</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">Welcome to The Future of Hospitality</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience seamless ordering, digital payments, and premium service at Mozambique's premier entertainment
            venue.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="menu-item bg-card border-border">
            <CardHeader className="text-center">
              <QrCode className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>QR Menu</CardTitle>
              <CardDescription>Scan & order instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/menu">
                <Button className="w-full">View Menu</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="menu-item bg-card border-border">
            <CardHeader className="text-center">
              <Menu className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Digital Wallet</CardTitle>
              <CardDescription>Cashless payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/wallet">
                <Button className="w-full">My Wallet</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="menu-item bg-card border-border">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Staff Portal</CardTitle>
              <CardDescription>POS & management</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/staff">
                <Button className="w-full">Staff Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="menu-item bg-card border-border">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Analytics & control</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full">Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Services Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <h3 className="text-xl font-playfair font-bold mb-2 text-primary">Bar & Lounge</h3>
            <p className="text-muted-foreground">Premium drinks, cocktails, and entertainment</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-playfair font-bold mb-2 text-primary">Restaurant</h3>
            <p className="text-muted-foreground">Delicious food and dining experience</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-playfair font-bold mb-2 text-primary">Barbershop</h3>
            <p className="text-muted-foreground">Professional grooming services</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-playfair font-bold mb-2 text-primary">Tattoo Studio</h3>
            <p className="text-muted-foreground">Artistic tattoo and body art</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-playfair font-bold mb-2 text-primary">Spa Services</h3>
            <p className="text-muted-foreground">Manicure, pedicure, and massages</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-playfair font-bold mb-2 text-primary">Arts Shop</h3>
            <p className="text-muted-foreground">Unique art and clothing collection</p>
          </div>
        </div>

        {/* Entry Information */}
        <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-playfair">Entry Information</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">Before 20:00</h4>
                <p className="text-muted-foreground">Free entry to all services</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">After 20:00</h4>
                <p className="text-muted-foreground">500 MZN entry ticket (redeemable for drinks & food)</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Operating Hours: Tue-Thu: 09:00-00:00 | Fri-Sun: 09:00-06:00
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-12 py-6 text-center text-muted-foreground text-sm border-t border-border">
        <p>THE SPOT • Mozambique's Premier Entertainment Venue</p>
        <p className="mt-2">© 2025 • Experience Excellence</p>
      </footer>
    </div>
  )
}
