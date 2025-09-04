import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">TalentHub</h1>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-semibold">Verification Failed</CardTitle>
            <CardDescription className="text-base">
              There was an issue verifying your email address. The verification link may have expired or been used
              already.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-md">
              <p className="font-medium mb-2">What you can do:</p>
              <ul className="space-y-1 text-xs">
                <li>• Try signing up again with the same email</li>
                <li>• Check if you already have an account and try signing in</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1 h-11 bg-slate-900 hover:bg-slate-800">
                <Link href="/auth/signup">Sign Up Again</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 h-11 bg-transparent">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
