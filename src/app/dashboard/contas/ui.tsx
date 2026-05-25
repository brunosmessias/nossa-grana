"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { upsertAccountSchema } from "@/shared/schemas/account"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { CurrencyInput } from "@/components/ui/currency-input"
import { ColorPicker } from "@/components/ui/color-picker"
import { IconPicker } from "@/components/ui/icon-picker"
import { IconBadge } from "@/components/ui/icon-badge"
import {
  Plus, Archive, ChevronDown, ChevronUp, PiggyBank, CheckCircle2,
} from "lucide-react"
import { api } from "@/trpc/react"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"

type AccountType = "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT" | "CREDIT_CARD" | "LOAN" | "GOAL"

type Account = {
  id: string; familyId: string; name: string; type: AccountType
  icon: string; color: string; initialBalanceCents: number; archived: boolean
  balanceCents: number; targetAmountCents: number | null; targetDate: string | null
}

type Transaction = {
  id: string; accountId: string; type: "INCOME" | "EXPENSE"
  amountCents: number; transactionAt: string
}

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

const typeLabels: Record<AccountType, string> = {
  CHECKING: "Corrente", SAVINGS: "Poupança", CASH: "Carteira",
  INVESTMENT: "Investimento", CREDIT_CARD: "Cartão", LOAN: "Empréstimo", GOAL: "Meta",
}

const defaultIcons: Record<AccountType, string> = {
  CHECKING: "bank", SAVINGS: "savings", CASH: "wallet",
  INVESTMENT: "investments", CREDIT_CARD: "creditCard", LOAN: "money", GOAL: "savings",
}

function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number)
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(y, m - 1, 1))
}

function monthsBetween(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth()
}

function computeSparklineData(account: Account, transactions: Transaction[]) {
  const now = new Date()
  const months: string[] = []
  for (let i = 5; i >= 0; i--) months.push(getMonthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)))
  const accountTxs = transactions.filter((t) => t.accountId === account.id)
  return months.map((mk) => {
    const [y, m] = mk.split("-").map(Number)
    const endOf = new Date(y, m, 0, 23, 59, 59)
    let balance = account.initialBalanceCents
    for (const tx of accountTxs) {
      if (new Date(tx.transactionAt) <= endOf) balance += tx.type === "INCOME" ? tx.amountCents : -tx.amountCents
    }
    return { month: monthLabel(mk), balance: balance / 100 }
  })
}

function Sparkline({ data, color }: { data: { month: string; balance: number }[]; color: string }) {
  if (data.length < 2) return null
  return (
    <div className="h-10 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line type="monotone" dataKey="balance" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function GoalProgress({ account }: { account: Account }) {
  if (!account.targetAmountCents || !["SAVINGS", "INVESTMENT", "GOAL"].includes(account.type)) return null
  const pct = Math.min((account.balanceCents / account.targetAmountCents) * 100, 100)
  const met = account.balanceCents >= account.targetAmountCents
  const barColor = met ? "bg-green-500" : pct >= 50 ? "bg-green-500" : "bg-yellow-500"
  let monthlyHint: string | null = null
  let overdue = false
  if (account.targetDate && !met) {
    const target = new Date(account.targetDate)
    if (target < new Date()) { overdue = true } else {
      const remaining = monthsBetween(new Date(), target)
      if (remaining > 0) monthlyHint = brl(Math.ceil((account.targetAmountCents - account.balanceCents) / remaining))
    }
  }
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{brl(account.balanceCents)} de {brl(account.targetAmountCents)}</span>
        <span className="font-medium">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      {met && <Badge variant="outline" className="gap-1 text-green-500"><CheckCircle2 className="size-3" /> Meta atingida!</Badge>}
      {!met && overdue && <p className="text-xs font-medium text-red-500">Prazo vencido</p>}
      {!met && !overdue && monthlyHint && <p className="text-xs text-muted-foreground">Guarde {monthlyHint}/mês</p>}
    </div>
  )
}

function AccountCard({ account, sparkData, onEdit, onArchive }: {
  account: Account; sparkData: { month: string; balance: number }[]; onEdit: () => void; onArchive: () => void
}) {
  return (
    <Card className="border-border/50 cursor-pointer transition-colors hover:border-border" onClick={onEdit}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <IconBadge icon={account.icon} color={account.color} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{account.name}</p>
              <Badge variant="outline" className="shrink-0 text-[10px]">{typeLabels[account.type]}</Badge>
            </div>
            <p className={`text-lg font-bold ${account.balanceCents < 0 ? "text-red-500" : ""}`}>{brl(account.balanceCents)}</p>
            <GoalProgress account={account} />
          </div>
        </div>
        <div className="hidden flex-col items-end gap-2 sm:flex">
          <Sparkline data={sparkData} color={account.color} />
          {!account.archived && (
            <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={(e) => { e.stopPropagation(); onArchive() }} title="Arquivar">
              <Archive className="size-3" />
            </Button>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:hidden">
          {!account.archived && (
            <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={(e) => { e.stopPropagation(); onArchive() }} title="Arquivar">
              <Archive className="size-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const clientSchema = upsertAccountSchema.pick({ name: true })
type FormErrors = Partial<Record<"name", string>>

function AccountFormDialog({ open, onOpenChange, familyId, account, onSuccess }: {
  open: boolean; onOpenChange: (v: boolean) => void; familyId: string; account: Account | null; onSuccess: () => Promise<void>
}) {
  const upsertMutation = api.accounts.upsert.useMutation()
  const isEdit = !!account
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("CHECKING")
  const [icon, setIcon] = useState("bank")
  const [color, setColor] = useState("#1866e4")
  const [initialCents, setInitialCents] = useState(0)
  const [targetCents, setTargetCents] = useState(0)
  const [targetDate, setTargetDate] = useState("")
  const [archived, setArchived] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(account?.name ?? ""); setType(account?.type ?? "CHECKING")
      setIcon(account?.icon ?? defaultIcons[account?.type ?? "CHECKING"])
      setColor(account?.color ?? "#1866e4"); setInitialCents(account?.initialBalanceCents ?? 0)
      setTargetCents(account?.targetAmountCents ?? 0)
      setTargetDate(account?.targetDate ? new Date(account.targetDate).toISOString().split("T")[0] : "")
      setArchived(account?.archived ?? false); setErrors({}); setSubmitting(false)
    }
  }, [open, account])

  const handleSubmit = async () => {
    const result = clientSchema.safeParse({ name })
    if (!result.success) { const fe: FormErrors = {}; for (const i of result.error.issues) fe[i.path[0] as "name"] = i.message; setErrors(fe); return }
    setErrors({}); setSubmitting(true)
    try {
      const body: Record<string, unknown> = { familyId, name: result.data.name, type, icon, color, initialBalanceCents: initialCents, archived }
      if (account) body.id = account.id
      if (targetCents > 0) body.targetAmountCents = targetCents
      if (targetDate) body.targetDate = new Date(targetDate + "T12:00:00").toISOString()
      await upsertMutation.mutateAsync(body as Parameters<typeof upsertMutation.mutateAsync>[0])
      toast.success(isEdit ? "Conta atualizada" : "Conta criada"); onOpenChange(false); await onSuccess()
    } catch { toast.error("Não foi possível salvar. Tente novamente.") } finally { setSubmitting(false) }
  }

  const showTarget = ["SAVINGS", "INVESTMENT", "GOAL"].includes(type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Editar conta" : "Nova conta"}</DialogTitle><DialogDescription>{isEdit ? "Altere os dados da conta" : "Adicione uma conta financeira"}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Nome</Label><Input placeholder="Ex: Nubank" value={name} onChange={(e) => { setName(e.target.value); setErrors({}) }} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
          <div className="space-y-2"><Label>Tipo</Label><Select value={type} onValueChange={(v) => { if (v) { setType(v as AccountType); setIcon(defaultIcons[v as AccountType]) } }}><SelectTrigger><SelectValue>{(v: string | null) => v ? typeLabels[v as AccountType] ?? v : "Selecionar"}</SelectValue></SelectTrigger><SelectContent>{(Object.keys(typeLabels) as AccountType[]).map((t) => <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Saldo inicial</Label><CurrencyInput value={initialCents} onChange={setInitialCents} /></div>
          {showTarget && (<><div className="space-y-2"><Label>Valor da meta</Label><CurrencyInput value={targetCents} onChange={setTargetCents} /></div><div className="space-y-2"><Label>Data limite</Label><Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></div></>)}
          {isEdit && (<label className="flex items-center gap-2"><input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} className="size-4 rounded border border-input" /><span className="text-sm">Conta arquivada</span></label>)}
          <div className="space-y-2"><Label>Ícone</Label><IconPicker value={icon} color={color} onChange={setIcon} /></div>
          <div className="space-y-2"><Label>Cor</Label><ColorPicker value={color} onChange={setColor} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Selecione a origem"),
  toAccountId: z.string().min(1, "Selecione o destino"),
  amountCents: z.number().int().positive("Informe um valor maior que zero"),
  description: z.string().max(120).optional().default(""),
})
type TransferErrors = Partial<Record<keyof z.infer<typeof transferSchema>, string>>

function TransferDialog({ open, onOpenChange, familyId, accounts, onSuccess }: {
  open: boolean; onOpenChange: (v: boolean) => void; familyId: string; accounts: Account[]; onSuccess: () => Promise<void>
}) {
  const transferMutation = api.accounts.transfer.useMutation()
  const [fromId, setFromId] = useState("")
  const [toId, setToId] = useState("")
  const [amount, setAmount] = useState(0)
  const [desc, setDesc] = useState("")
  const [errors, setErrors] = useState<TransferErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const fromAccounts = useMemo(() => accounts.filter((a) => !a.archived && a.type === "CHECKING"), [accounts])
  const toAccounts = useMemo(() => accounts.filter((a) => !a.archived && a.id !== fromId), [accounts, fromId])

  useEffect(() => {
    if (open) { setFromId(fromAccounts[0]?.id ?? ""); setToId(""); setAmount(0); setDesc(""); setErrors({}); setSubmitting(false) }
  }, [open, fromAccounts])

  const handleSubmit = async () => {
    const result = transferSchema.safeParse({ fromAccountId: fromId, toAccountId: toId, amountCents: amount, description: desc })
    if (!result.success) { const fe: TransferErrors = {}; for (const i of result.error.issues) fe[i.path[0] as keyof TransferErrors] = i.message; setErrors(fe); return }
    setErrors({}); setSubmitting(true)
    try {
      await transferMutation.mutateAsync({ familyId, ...result.data })
      toast.success("Transferência realizada"); onOpenChange(false); await onSuccess()
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erro na transferência") } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Guardar dinheiro</DialogTitle><DialogDescription>Transfira de uma conta corrente para outra conta</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Origem (conta corrente)</Label><Select value={fromId} onValueChange={(v) => { if (v) { setFromId(v); setErrors((e) => ({ ...e, fromAccountId: undefined })) } }}><SelectTrigger aria-invalid={!!errors.fromAccountId}><SelectValue placeholder="Selecionar">{(v: string | null) => v ? fromAccounts.find((a) => a.id === v)?.name ?? v : "Selecionar"}</SelectValue></SelectTrigger><SelectContent>{fromAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select>{errors.fromAccountId && <p className="text-xs text-destructive">{errors.fromAccountId}</p>}</div>
          <div className="space-y-2"><Label>Destino</Label><Select value={toId} onValueChange={(v) => { if (v) { setToId(v); setErrors((e) => ({ ...e, toAccountId: undefined })) } }}><SelectTrigger aria-invalid={!!errors.toAccountId}><SelectValue placeholder="Selecionar">{(v: string | null) => v ? toAccounts.find((a) => a.id === v)?.name ?? v : "Selecionar"}</SelectValue></SelectTrigger><SelectContent>{toAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select>{errors.toAccountId && <p className="text-xs text-destructive">{errors.toAccountId}</p>}</div>
          <div className="space-y-2"><Label>Valor</Label><CurrencyInput value={amount} onChange={(v) => { setAmount(v); setErrors((e) => ({ ...e, amountCents: undefined })) }} />{errors.amountCents && <p className="text-xs text-destructive">{errors.amountCents}</p>}</div>
          <div className="space-y-2"><Label>Descrição</Label><Input placeholder="Ex: Guardar sobras" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Transferindo..." : "Transferir"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AccountsPageClient({ familyId }: { familyId: string }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [archivedOpen, setArchivedOpen] = useState(false)

  const upsertMutation = api.accounts.upsert.useMutation()

  const { data: accountsData } = api.accounts.list.useQuery(
    { familyId },
    { enabled: !!familyId },
  )

  const { data: transactionsData } = api.transactions.listAll.useQuery(
    { familyId },
    { enabled: !!familyId },
  )

  const invalidate = useInvalidateQueries()

  const allAccounts = (accountsData?.accounts ?? []) as unknown as Account[]
  const transactions = (transactionsData ?? []) as unknown as Transaction[]

  const refresh = async () => {
    await invalidate(["accounts", "transactions"])
  }

  const active = useMemo(() => allAccounts.filter((a) => !a.archived), [allAccounts])
  const archived = useMemo(() => allAccounts.filter((a) => a.archived), [allAccounts])
  const totalBalance = useMemo(() => active.reduce((s, a) => s + a.balanceCents, 0), [active])

  const sparklines = useMemo(() => {
    const map = new Map<string, { month: string; balance: number }[]>()
    for (const acc of allAccounts) map.set(acc.id, computeSparklineData(acc, transactions))
    return map
  }, [allAccounts, transactions])

  const handleArchive = async (account: Account) => {
    try {
      await upsertMutation.mutateAsync({
        familyId, id: account.id, name: account.name, type: account.type,
        icon: account.icon, color: account.color, initialBalanceCents: account.initialBalanceCents, archived: true,
      })
      toast.success(`${account.name} arquivada`); await refresh()
    } catch { toast.error("Erro ao arquivar") }
  }

  if (!accountsData) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Carregando...</p></div>

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold text-primary sm:text-3xl">Contas</h2>
          <p className="text-sm text-muted-foreground">{active.length} ativa{active.length !== 1 ? "s" : ""} · Saldo total: {brl(totalBalance)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => setTransferOpen(true)}><PiggyBank className="mr-1 size-3" /> <span className="hidden sm:inline">Guardar dinheiro</span><span className="sm:hidden">Guardar</span></Button>
          <Button size="sm" onClick={() => { setEditAccount(null); setFormOpen(true) }}><Plus className="mr-1 size-3" /> Nova conta</Button>
        </div>
      </section>

      {active.length === 0 ? (
        <Card className="border-border/50"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="text-muted-foreground">Nenhuma conta cadastrada</p><Button size="sm" onClick={() => { setEditAccount(null); setFormOpen(true) }}><Plus className="mr-1 size-3" /> Criar primeira conta</Button></CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {active.map((acc) => (
            <AccountCard key={acc.id} account={acc} sparkData={sparklines.get(acc.id) ?? []} onEdit={() => { setEditAccount(acc); setFormOpen(true) }} onArchive={() => handleArchive(acc)} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <section className="space-y-3">
          <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setArchivedOpen(!archivedOpen)}>
            {archivedOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />} Arquivadas ({archived.length})
          </button>
          {archivedOpen && (
            <div className="grid gap-3">
              {archived.map((acc) => (
                <AccountCard key={acc.id} account={acc} sparkData={sparklines.get(acc.id) ?? []} onEdit={() => { setEditAccount(acc); setFormOpen(true) }} onArchive={() => handleArchive(acc)} />
              ))}
            </div>
          )}
        </section>
      )}

      <AccountFormDialog open={formOpen} onOpenChange={setFormOpen} familyId={familyId} account={editAccount} onSuccess={refresh} />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} familyId={familyId} accounts={allAccounts} onSuccess={refresh} />
    </div>
  )
}
