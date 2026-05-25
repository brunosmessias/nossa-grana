"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyInput } from "@/components/ui/currency-input"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import {
  CreditCard,
  Home,
  Car,
  UtensilsCrossed,
  GraduationCap,
  Banknote,
  ShoppingBag,
  Heart,
  Plane,
  Gamepad2,
  Check,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react"

type Step = "family" | "categories" | "accounts" | "invite"

const steps: { key: Step; label: string; number: number }[] = [
  { key: "family", label: "Família", number: 1 },
  { key: "categories", label: "Categorias", number: 2 },
  { key: "accounts", label: "Contas", number: 3 },
  { key: "invite", label: "Convidar", number: 4 },
]

interface SuggestedCategory {
  name: string
  kind: "INCOME" | "EXPENSE"
  icon: string
  color: string
  label: string
  IconComp: LucideIcon
}

const suggestedCategories: SuggestedCategory[] = [
  { name: "Cartão de Crédito", kind: "EXPENSE", icon: "credit-card", color: "#6366f1", label: "Cartão de Crédito", IconComp: CreditCard },
  { name: "Casa", kind: "EXPENSE", icon: "home", color: "#f59e0b", label: "Casa", IconComp: Home },
  { name: "Carro", kind: "EXPENSE", icon: "car", color: "#3b82f6", label: "Carro", IconComp: Car },
  { name: "Alimentação", kind: "EXPENSE", icon: "utensils", color: "#ef4444", label: "Alimentação", IconComp: UtensilsCrossed },
  { name: "Educação", kind: "EXPENSE", icon: "graduation-cap", color: "#10b981", label: "Educação", IconComp: GraduationCap },
  { name: "Salário", kind: "INCOME", icon: "banknote", color: "#22c55e", label: "Salário", IconComp: Banknote },
  { name: "Compras", kind: "EXPENSE", icon: "shopping-bag", color: "#ec4899", label: "Compras", IconComp: ShoppingBag },
  { name: "Saúde", kind: "EXPENSE", icon: "heart", color: "#f43f5e", label: "Saúde", IconComp: Heart },
  { name: "Viagem", kind: "EXPENSE", icon: "plane", color: "#06b6d4", label: "Viagem", IconComp: Plane },
  { name: "Lazer", kind: "EXPENSE", icon: "gamepad-2", color: "#8b5cf6", label: "Lazer", IconComp: Gamepad2 },
]

interface AccountEntry {
  name: string
  type: "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT" | "CREDIT_CARD" | "LOAN" | "GOAL"
  icon: string
  color: string
  initialBalanceCents: number
}

const defaultChecking: AccountEntry = {
  name: "Conta Corrente",
  type: "CHECKING",
  icon: "landmark",
  color: "#3b82f6",
  initialBalanceCents: 0,
}

const accountTypeLabels: Record<string, string> = {
  CHECKING: "Corrente",
  SAVINGS: "Poupança",
  CASH: "Carteira",
  INVESTMENT: "Investimento",
  CREDIT_CARD: "Cartão",
  LOAN: "Empréstimo",
  GOAL: "Meta",
}

export function OnboardingClient({ userName }: { userName: string }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("family")
  const [familyName, setFamilyName] = useState("")
  const [familyId, setFamilyId] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitedEmails, setInvitedEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const createFamilyMutation = api.family.create.useMutation()
  const createCategoryMutation = api.categories.create.useMutation()
  const upsertAccountMutation = api.accounts.upsert.useMutation()
  const inviteMemberMutation = api.family.invite.useMutation()

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(suggestedCategories.map((c) => c.name))
  )
  const [accounts, setAccounts] = useState<AccountEntry[]>([{ ...defaultChecking }])

  const stepIndex = steps.findIndex((s) => s.key === currentStep)

  const createFamily = async () => {
    setLoading(true)
    try {
      const result = await createFamilyMutation.mutateAsync({ name: familyName })
      const famId = (result as { familyId?: string }).familyId
      if (!famId) {
        toast.error("Erro ao criar família")
        setLoading(false)
        return
      }
      setFamilyId(famId)
      setLoading(false)
      setCurrentStep("categories")
    } catch {
      toast.error("Erro ao criar família")
      setLoading(false)
    }
  }

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const createCategories = async () => {
    setLoading(true)
    const toCreate = suggestedCategories.filter((c) => selectedCategories.has(c.name))

    try {
      await Promise.all(
        toCreate.map((cat) =>
          createCategoryMutation.mutateAsync({
            familyId,
            name: cat.name,
            kind: cat.kind,
            icon: cat.icon,
            color: cat.color,
          })
        )
      )
      setCurrentStep("accounts")
    } catch {
      toast.error("Erro ao criar categorias. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const updateAccount = (index: number, updates: Partial<AccountEntry>) => {
    setAccounts((prev) => prev.map((a, i) => (i === index ? { ...a, ...updates } : a)))
  }

  const addAccount = () => {
    setAccounts((prev) => [
      ...prev,
      { name: "", type: "SAVINGS", icon: "piggy-bank", color: "#10b981", initialBalanceCents: 0 },
    ])
  }

  const removeAccount = (index: number) => {
    setAccounts((prev) => prev.filter((_, i) => i !== index))
  }

  const createAccounts = async () => {
    const validAccounts = accounts.filter((a) => a.name.trim().length >= 2)
    if (validAccounts.length === 0) {
      setCurrentStep("invite")
      return
    }

    setLoading(true)
    try {
      await Promise.all(
        validAccounts.map((acc) =>
          upsertAccountMutation.mutateAsync({
            familyId,
            name: acc.name,
            type: acc.type,
            icon: acc.icon,
            color: acc.color,
            initialBalanceCents: acc.initialBalanceCents,
          })
        )
      )
      setCurrentStep("invite")
    } catch {
      toast.error("Erro ao criar contas. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const invite = async () => {
    setLoading(true)
    try {
      await inviteMemberMutation.mutateAsync({ familyId, email: inviteEmail })
      setInvitedEmails((prev) => [...prev, inviteEmail])
      setInviteEmail("")
      setLoading(false)
    } catch {
      toast.error("Erro ao enviar convite")
      setLoading(false)
    }
  }

  const goBack = () => {
    const idx = steps.findIndex((s) => s.key === currentStep)
    if (idx > 0) setCurrentStep(steps[idx - 1].key)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo, {userName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure sua família para começar
          </p>
        </div>

        <div className="flex items-center justify-center gap-1">
          {steps.map((step, idx) => (
            <div key={step.key} className="flex items-center">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  idx < stepIndex && "bg-primary text-primary-foreground",
                  idx === stepIndex && "bg-primary text-primary-foreground",
                  idx > stepIndex && "bg-muted text-muted-foreground"
                )}
              >
                {idx < stepIndex ? <Check className="size-4" /> : step.number}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 w-6 transition-colors",
                    idx < stepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {currentStep === "family" && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Criar família</CardTitle>
              <CardDescription>Dê um nome para o grupo financeiro da sua família</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family-name">Nome da família</Label>
                <Input
                  id="family-name"
                  placeholder="Ex: Família Silva"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                />
              </div>
              <Button onClick={createFamily} disabled={loading || !familyName} className="w-full">
                Criar família
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "categories" && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Categorias sugeridas</CardTitle>
              <CardDescription>
                Selecione as categorias para organizar seus gastos. Você pode editar depois.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {suggestedCategories.map((cat) => {
                  const isSelected = selectedCategories.has(cat.name)
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                        isSelected
                          ? "border-primary/50 bg-primary/10"
                          : "border-border/50 bg-muted/30 opacity-60 hover:opacity-100"
                      )}
                    >
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <cat.IconComp size={16} style={{ color: cat.color }} />
                      </div>
                      <span className="truncate font-medium">{cat.label}</span>
                      {isSelected && (
                        <Check className="ml-auto size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={createCategories}
                  disabled={loading || selectedCategories.size === 0}
                  className="flex-1"
                >
                  {loading ? "Criando..." : "Continuar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "accounts" && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Contas iniciais</CardTitle>
              <CardDescription>
                Cadastre sua conta corrente e poupanças ou cofrinhos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {accounts.map((acc, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {accountTypeLabels[acc.type]}
                      </span>
                      {idx > 0 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeAccount(idx)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder={idx === 0 ? "Ex: Nubank, Banco do Brasil..." : "Ex: Poupança, Cofrinho viagem..."}
                      value={acc.name}
                      onChange={(e) => updateAccount(idx, { name: e.target.value })}
                    />
                    <CurrencyInput
                      value={acc.initialBalanceCents}
                      onChange={(cents) => updateAccount(idx, { initialBalanceCents: cents })}
                      placeholder="Saldo inicial"
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={addAccount}
                className="w-full"
              >
                <Plus className="mr-1 size-3.5" />
                Adicionar poupança / cofrinho
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={createAccounts}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Criando..." : "Continuar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "invite" && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Convidar membros</CardTitle>
              <CardDescription>
                Adicione pessoas para gerenciar as finanças juntos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-mail</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={invite} disabled={loading || !inviteEmail} variant="outline">
                    Convidar
                  </Button>
                </div>
              </div>

              {invitedEmails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {invitedEmails.map((email) => (
                    <Badge key={email} variant="secondary">{email}</Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => router.push("/")} className="flex-1">
                  Finalizar e ir para Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
