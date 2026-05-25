"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/server/auth/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [otp, setOtp] = useState("")
  const [message, setMessage] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    setLoading(true)
    setMessage("")
    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    })
    setOtpSent(true)
    setMessage("Código enviado por e-mail")
    setLoading(false)
  }

  const verifyOtp = async () => {
    setLoading(true)
    setMessage("")
    await authClient.signIn.emailOtp({
      email,
      otp,
      name: name || undefined,
    })
    router.push("/onboarding")
  }

  const loginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/onboarding",
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-lg font-bold text-primary">₢</span>
          </div>
          <CardTitle className="text-xl">Entrar</CardTitle>
          <CardDescription>
            Use seu e-mail ou conta Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={loginWithGoogle} variant="outline" className="flex-1">
              <svg className="mr-2 size-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            <Button onClick={sendOtp} disabled={loading || !email} className="flex-1">
              Enviar código
            </Button>
          </div>

          {otpSent && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="otp">Código OTP</Label>
                <Input
                  id="otp"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={verifyOtp} disabled={loading || !otp} className="w-full">
                  Entrar
                </Button>
              </div>
            </>
          )}

          {message && (
            <p className="text-center text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
