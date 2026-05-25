"use client"

import { useState } from "react"
import { createCategorySchema } from "@/shared/schemas/category"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/sonner"
import { IconBadge } from "@/components/ui/icon-badge"
import { CurrencyInput } from "@/components/ui/currency-input"
import { ColorPicker } from "@/components/ui/color-picker"
import { IconPicker } from "@/components/ui/icon-picker"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
} from "recharts"
import { Pencil, TrendingUp, TrendingDown } from "lucide-react"

type Category = { id: string; name: string; kind: "INCOME" | "EXPENSE"; icon: string; color: string; monthlyBudgetCents: number | null }

const clientSchema = createCategorySchema.pick({ name: true })
type FormErrors = Partial<Record<"name", string>>

function getProgressColor(pct: number): string {
  if (pct >= 100) return "bg-red-500"
  if (pct >= 80) return "bg-yellow-500"
  return "bg-green-500"
}

function TrendIndicator({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined) return null
  if (current === 0) return <span className="text-xs text-muted-foreground">—</span>
  if (previous === 0) return <Badge variant="outline" className="text-xs text-blue-500">Novo</Badge>
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct > 0) return <span className="flex items-center gap-0.5 text-xs font-medium text-red-500"><TrendingUp className="size-3" /> {pct}%</span>
  if (pct < 0) return <span className="flex items-center gap-0.5 text-xs font-medium text-green-500"><TrendingDown className="size-3" /> {Math.abs(pct)}%</span>
  return <span className="text-xs text-muted-foreground">0%</span>
}

export function CategoryCard({ category, spent, prevSpent, brl: brlFn, onEdit }: {
  category: Category; spent: number; prevSpent?: number; brl: (c: number) => string; onEdit: (cat: Category) => void
}) {
  const budget = category.monthlyBudgetCents
  const budgetPct = budget ? Math.min((spent / budget) * 100, 100) : 0
  return (
    <Card className="border-border/50">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBadge icon={category.icon} color={category.color} size="md" />
            <div><p className="text-sm font-semibold">{category.name}</p><p className="text-xs text-muted-foreground">{brlFn(spent)}</p></div>
          </div>
          <div className="flex items-center gap-2">
            {category.kind === "EXPENSE" && prevSpent !== undefined && <TrendIndicator current={spent} previous={prevSpent} />}
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(category)}><Pencil className="size-3" /></Button>
          </div>
        </div>
        {budget !== null && budget > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground"><span>{brlFn(spent)}</span><span>{brlFn(budget)}</span></div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full transition-all ${getProgressColor(budgetPct)}`} style={{ width: `${budgetPct}%` }} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CategoryFormDialog({ open, onOpenChange, onSubmit, title, description, defaultValues }: {
  open: boolean; onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; kind?: "INCOME" | "EXPENSE"; icon?: string; color?: string; monthlyBudgetCents?: number }) => Promise<void>
  title: string; description: string; defaultValues?: Category
}) {
  const [name, setName] = useState(defaultValues?.name ?? "")
  const [kind, setKind] = useState<"INCOME" | "EXPENSE">(defaultValues?.kind ?? "EXPENSE")
  const [icon, setIcon] = useState(defaultValues?.icon ?? "tag")
  const [color, setColor] = useState(defaultValues?.color ?? "#1866e4")
  const [budget, setBudget] = useState(defaultValues?.monthlyBudgetCents ?? 0)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const handleOpen = (val: boolean) => {
    if (val) {
      setName(defaultValues?.name ?? ""); setKind(defaultValues?.kind ?? "EXPENSE")
      setIcon(defaultValues?.icon ?? "tag"); setColor(defaultValues?.color ?? "#1866e4")
      setBudget(defaultValues?.monthlyBudgetCents ?? 0)
    }
    setErrors({}); onOpenChange(val)
  }

  const handleSubmit = async () => {
    const result = clientSchema.safeParse({ name })
    if (!result.success) { const fe: FormErrors = {}; for (const i of result.error.issues) fe[i.path[0] as "name"] = i.message; setErrors(fe); return }
    setSubmitting(true)
    try {
      await onSubmit({ name: result.data.name, kind, icon, color, monthlyBudgetCents: budget > 0 ? budget : undefined })
      toast.success(defaultValues ? "Categoria atualizada" : "Categoria criada"); onOpenChange(false)
    } catch { toast.error("Não foi possível salvar.") } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Nome</Label><Input placeholder="Ex: Alimentação" value={name} onChange={(e) => { setName(e.target.value); setErrors({}) }} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
          {!defaultValues && (
            <div className="space-y-2"><Label>Tipo</Label><Select value={kind} onValueChange={(v) => { if (v) setKind(v as "INCOME" | "EXPENSE") }}><SelectTrigger><SelectValue>{(v: string | null) => v === "INCOME" ? "Receita" : v === "EXPENSE" ? "Despesa" : "Selecionar"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="EXPENSE">Despesa</SelectItem><SelectItem value="INCOME">Receita</SelectItem></SelectContent></Select></div>
          )}
          <div className="space-y-2"><Label>Orçamento mensal (opcional)</Label><CurrencyInput value={budget} onChange={setBudget} /></div>
          <div className="space-y-2"><Label>Ícone</Label><IconPicker value={icon} color={color} onChange={setIcon} /></div>
          <div className="space-y-2"><Label>Cor</Label><ColorPicker value={color} onChange={setColor} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Salvando..." : "Salvar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ExpenseDonutChart({ categories, categorySpent, onSelectCategory }: {
  categories: Category[]; categorySpent: Map<string, number>; onSelectCategory: (id: string) => void
}) {
  const chartData = (() => {
    const items = categories.map((c) => ({ id: c.id, name: c.name, color: c.color, value: categorySpent.get(c.id) ?? 0 })).filter((i) => i.value > 0).sort((a, b) => b.value - a.value)
    if (items.length <= 5) return items
    const top5 = items.slice(0, 5)
    const others = items.slice(5)
    return [...top5, { id: "__others__", name: "Outros", color: "#6b7280", value: others.reduce((s, i) => s + i.value, 0) }]
  })()
  if (chartData.length === 0) return null
  return (
    <Card className="border-border/50 p-4">
      <p className="mb-3 text-sm font-semibold">Distribuição de despesas</p>
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} onClick={(_e, idx) => { const d = chartData[idx]; if (d && d.id !== "__others__") onSelectCategory(d.id) }} className="cursor-pointer">{chartData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}</Pie><Tooltip formatter={(value) => [new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) / 100), ""]} /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2">
          {chartData.map((item) => (
            <button key={item.id} type="button" className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-muted" onClick={() => { if (item.id !== "__others__") onSelectCategory(item.id) }}>
              <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function CategoryLineChart({ data, color }: { data: Array<{ month: string; total: number }>; color: string }) {
  if (data.length === 0) return <p className="text-center text-sm text-muted-foreground">Sem dados suficientes</p>
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="currentColor" className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v: number) => `${(v / 100).toFixed(0)}`} />
        <Tooltip formatter={(value) => [new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) / 100), ""]} />
        <Line type="monotone" dataKey="total" stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function TrendRanking({ categories, categorySpent, prevCategorySpent }: {
  categories: Category[]; categorySpent: Map<string, number>; prevCategorySpent: Map<string, number>
}) {
  const { topGrew, topReduced } = (() => {
    const withChange = categories.map((c) => {
      const curr = categorySpent.get(c.id) ?? 0; const prev = prevCategorySpent.get(c.id) ?? 0
      if (curr === 0 && prev === 0) return null
      const pct = prev === 0 ? (curr > 0 ? Infinity : 0) : Math.round(((curr - prev) / prev) * 100)
      return { ...c, curr, prev, pct }
    }).filter((x): x is NonNullable<typeof x> => x !== null).filter((x) => x.pct !== 0)
    const grew = [...withChange].filter((x) => x.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 3)
    const reduced = [...withChange].filter((x) => x.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 3)
    return { topGrew: grew, topReduced: reduced }
  })()
  if (topGrew.length === 0 && topReduced.length === 0) return null
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Tendências vs mês anterior</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {topGrew.length > 0 && (
          <Card className="border-border/50"><CardContent className="space-y-2 p-4">
            <p className="text-sm font-semibold text-red-500">↑ Mais gastou</p>
            {topGrew.map((c) => (
              <div key={c.id} className="flex items-center justify-between"><div className="flex items-center gap-2"><IconBadge icon={c.icon} color={c.color} size="sm" /><span className="text-sm">{c.name}</span></div><span className="text-xs font-medium text-red-500">+{c.pct === Infinity ? "Novo" : `${c.pct}%`}</span></div>
            ))}
          </CardContent></Card>
        )}
        {topReduced.length > 0 && (
          <Card className="border-border/50"><CardContent className="space-y-2 p-4">
            <p className="text-sm font-semibold text-green-500">↓ Mais reduziu</p>
            {topReduced.map((c) => (
              <div key={c.id} className="flex items-center justify-between"><div className="flex items-center gap-2"><IconBadge icon={c.icon} color={c.color} size="sm" /><span className="text-sm">{c.name}</span></div><span className="text-xs font-medium text-green-500">{c.pct}%</span></div>
            ))}
          </CardContent></Card>
        )}
      </div>
    </section>
  )
}
