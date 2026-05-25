"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { api } from "@/trpc/react"

export function AcceptInviteClient({ token }: { token: string }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const acceptMutation = api.family.acceptInvite.useMutation()

  const accept = async () => {
    setLoading(true)
    setMessage("")
    try {
      await acceptMutation.mutateAsync({ token })
      setAccepted(true)
      setTimeout(() => router.push("/"), 2000)
    } catch {
      setMessage("Não foi possível aceitar convite")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Logo size={20} />
          </div>
          <CardTitle className="text-xl">Aceitar convite</CardTitle>
          <CardDescription>
            {accepted
              ? "Você entrou na família!"
              : "Você foi convidado para entrar em uma família."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accepted ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="size-10 text-green-500" />
              <p className="text-sm font-medium text-green-500">Convite aceito com sucesso!</p>
              <p className="text-xs text-muted-foreground">Redirecionando...</p>
            </div>
          ) : (
            <Button onClick={accept} disabled={loading} className="w-full">
              {loading ? "Aceitando..." : "Aceitar convite"}
            </Button>
          )}

          {message && !accepted && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
