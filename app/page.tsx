import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">TalentHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-slate-900 mb-6 text-balance">Manage Your Talent Career Like a Pro</h2>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto text-pretty">
          The complete platform for actors, entrepreneurs, and influencers to track their promotional activities, manage
          PR coverage, and grow their audience across all channels.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Talent Management</CardTitle>
              <CardDescription>
                Manage multiple talents, track their progress, and coordinate promotional activities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Task Scheduling</CardTitle>
              <CardDescription>
                Schedule interviews, appearances, and promotional events with smart reminders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Analytics & Growth</CardTitle>
              <CardDescription>
                Track social media growth, engagement rates, and PR coverage effectiveness
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600">
          <p>&copy; 2024 TalentHub. Built for the entertainment industry.</p>
        </div>
      </footer>
    </div>
  )
}
