"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { z } from "zod"
import { createTransactionSchema, type SortDirection, type TransactionSortKey } from "@/shared/schemas/transaction"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { IconBadge } from "@/components/ui/icon-badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SortableHeader } from "@/components/ui/sortable-header"
import { Plus, Search, Trash2, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { api } from "@/trpc/react"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"

type Account = { id: string; name: string; type: string; icon: string; color: string; archived: boolean }
type Category = { id: string; name: string; kind: "INCOME" | "EXPENSE"; icon: string; color: string }
type Transaction = { id: string; description: string; type: "INCOME" | "EXPENSE"; amountCents: number; transactionAt: Date | string; categoryId: string; accountId: string }
type GroupMode = "list" | "day" | "week" | "month" | "category"

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function fmtShort(value: Date | string) {
  const iso = typeof value === "string" ? value : value.toISOString()
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(iso))
}

function toIsoString(value: Date | string): string {
  return typeof value === "string" ? value : value.toISOString()
}

function toDateInputValue(value: Date | string): string {
  return toIsoString(value).split("T")[0] ?? ""
}

function gKey(tx: Transaction, m: GroupMode): string {
  if (m === "list") return ""
  const iso = toIsoString(tx.transactionAt)
  if (m === "day") return iso.split("T")[0]
  if (m === "month") return iso.substring(0, 7)
  if (m === "category") return tx.categoryId || "__none__"
  const d = new Date(iso)
  const j = new Date(d.getFullYear(), 0, 1)
  const w = Math.ceil(((d.getTime() - j.getTime()) / 864e5 + j.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(w).padStart(2, "0")}`
}

function gLabel(k: string, m: GroupMode, cm: Map<string, Category>): string {
  if (m === "day") { const [y, mo, d] = k.split("-").map(Number); return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(y, mo - 1, d)) }
  if (m === "month") { const [y, mo] = k.split("-").map(Number); return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(y, mo - 1, 1)) }
  if (m === "category") return k === "__none__" ? "Sem categoria" : cm.get(k)?.name ?? k
  return `Semana ${k.split("-W")[1]} — ${k.split("-W")[0]}`
}

const formSchema = createTransactionSchema.pick({ categoryId: true, amountCents: true, description: true }).extend({ date: z.string().min(1, "Informe uma data"), accountId: z.string().min(1, "Selecione uma conta") })
type FormErrors = Partial<Record<keyof z.infer<typeof formSchema>, string>>

function TxFormDialog({ mode, transaction, accounts, categories, familyId, open, onOpenChange }: {
  mode: "create" | "edit"; transaction?: Transaction | null; accounts: Account[]; categories: Category[]
  familyId: string; open: boolean; onOpenChange: (v: boolean) => void
}) {
  const createMutation = api.transactions.create.useMutation()
  const updateMutation = api.transactions.update.useMutation()
  const invalidate = useInvalidateQueries()
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [accId, setAccId] = useState("")
  const [catId, setCatId] = useState("")
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [desc, setDesc] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const active = useMemo(() => accounts.filter((a) => !a.archived), [accounts])
  const cats = useMemo(() => categories.filter((c) => c.kind === txType), [categories, txType])

  useEffect(() => {
    if (!open) return
    if (mode === "edit" && transaction) {
      setTxType(transaction.type); setAccId(transaction.accountId); setCatId(transaction.categoryId)
      setAmount(transaction.amountCents); setDate(toDateInputValue(transaction.transactionAt)); setDesc(transaction.description)
    } else {
      setTxType("EXPENSE"); setAccId(active[0]?.id ?? ""); setCatId(""); setAmount(0)
      setDate(new Date().toISOString().split("T")[0]); setDesc("")
    }
    setErrors({}); setSubmitting(false)
  }, [open, mode, transaction, active])

  const submit = async () => {
    const r = formSchema.safeParse({ categoryId: catId || cats[0]?.id || "", amountCents: amount, description: desc, date, accountId: accId || active[0]?.id || "" })
    if (!r.success) { const e: FormErrors = {}; for (const i of r.error.issues) e[i.path[0] as keyof FormErrors] = i.message; setErrors(e); return }
    setErrors({}); setSubmitting(true)
    try {
      const [y, m, d] = r.data.date.split("-").map(Number); const iso = new Date(y, m - 1, d, 12).toISOString()
      if (mode === "edit" && transaction) {
        await updateMutation.mutateAsync({ familyId, transactionId: transaction.id, accountId: r.data.accountId, categoryId: r.data.categoryId, description: r.data.description, amountCents: r.data.amountCents, transactionAt: iso })
        toast.success("Transação atualizada")
      } else {
        await createMutation.mutateAsync({ familyId, type: txType, accountId: r.data.accountId, categoryId: r.data.categoryId, description: r.data.description, amountCents: r.data.amountCents, transactionAt: iso })
        toast.success(txType === "EXPENSE" ? "Despesa registrada" : "Receita registrada")
      }
      onOpenChange(false); await invalidate(["transactions", "accounts"])
    } catch { toast.error("Não foi possível salvar.") } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{mode === "edit" ? "Editar transação" : "Nova transação"}</DialogTitle><DialogDescription>{mode === "edit" ? "Altere os dados" : "Registre uma nova transação"}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          {mode === "create" && (<div className="flex gap-2"><Button size="sm" variant={txType === "EXPENSE" ? "default" : "outline"} onClick={() => setTxType("EXPENSE")}>Despesa</Button><Button size="sm" variant={txType === "INCOME" ? "default" : "outline"} onClick={() => setTxType("INCOME")}>Receita</Button></div>)}
          <div className="space-y-2"><Label>Conta</Label><Select value={accId || active[0]?.id || ""} onValueChange={(v) => { if (v) { setAccId(v); setErrors((e) => ({ ...e, accountId: undefined })) } }}><SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ? active.find((a) => a.id === v)?.name ?? v : "Selecionar"}</SelectValue></SelectTrigger><SelectContent>{active.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select>{errors.accountId && <p className="text-xs text-destructive">{errors.accountId}</p>}</div>
          <div className="space-y-2"><Label>Categoria</Label><Select value={catId || cats[0]?.id || ""} onValueChange={(v) => { if (v) { setCatId(v); setErrors((e) => ({ ...e, categoryId: undefined })) } }}><SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ? categories.find((c) => c.id === v)?.name ?? v : "Selecionar"}</SelectValue></SelectTrigger><SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}><div className="flex items-center gap-2"><IconBadge icon={c.icon} color={c.color} size="sm" /><span>{c.name}</span></div></SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Valor</Label><CurrencyInput value={amount} onChange={(v) => { setAmount(v); setErrors((e) => ({ ...e, amountCents: undefined })) }} />{errors.amountCents && <p className="text-xs text-destructive">{errors.amountCents}</p>}</div>
            <div className="space-y-2"><Label>Data</Label><Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setErrors((e2) => ({ ...e2, date: undefined })) }} />{errors.date && <p className="text-xs text-destructive">{errors.date}</p>}</div>
          </div>
          <div className="space-y-2"><Label>Descrição</Label><Input placeholder="Ex: Supermercado" value={desc} onChange={(e) => { setDesc(e.target.value); setErrors((e) => ({ ...e, description: undefined })) }} aria-invalid={!!errors.description} />{errors.description && <p className="text-xs text-destructive">{errors.description}</p>}</div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={submit} disabled={submitting}>{submitting ? "Salvando..." : mode === "edit" ? "Salvar" : "Criar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ open, onOpenChange, txId, familyId, desc }: {
  open: boolean; onOpenChange: (v: boolean) => void; txId: string; familyId: string; desc: string
}) {
  const deleteMutation = api.transactions.delete.useMutation()
  const invalidate = useInvalidateQueries()
  const [loading, setLoading] = useState(false)
  const del = async () => {
    setLoading(true)
    try {
      await deleteMutation.mutateAsync({ familyId, transactionId: txId })
      toast.success("Transação excluída"); onOpenChange(false); await invalidate(["transactions", "accounts"])
    } catch { toast.error("Erro ao excluir") } finally { setLoading(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Excluir transação</DialogTitle><DialogDescription>Tem certeza que deseja excluir &quot;{desc}&quot;?</DialogDescription></DialogHeader>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button variant="destructive" onClick={del} disabled={loading}>{loading ? "Excluindo..." : "Excluir"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SummarySidebar({ total, totalPages, page }: { total: number; totalPages: number; page: number }) {
  return (
    <Card><CardHeader className="text-base font-semibold">Resumo</CardHeader><CardContent className="space-y-3">
      <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total de transações</span><span className="font-semibold">{total}</span></div>
      <Separator />
      <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Página</span><span className="font-semibold">{page} de {totalPages}</span></div>
    </CardContent></Card>
  )
}

function TxRow({ tx, cat, acc, showGroup, gLabel: gLbl, gTotal, onEdit, onDel }: {
  tx: Transaction; cat?: Category; acc?: Account; showGroup: boolean; gLabel: string; gTotal: number; onEdit: (tx: Transaction) => void; onDel: (tx: Transaction) => void
}) {
  return (
    <>
      {showGroup && (<TableRow className="bg-muted/50 hover:bg-muted/50"><TableCell colSpan={7} className="py-2 text-sm font-semibold text-muted-foreground">{gLbl} <span className="ml-2 font-mono text-xs">({brl(gTotal)})</span></TableCell></TableRow>)}
      <TableRow className="cursor-pointer" onClick={() => onEdit(tx)}>
        <TableCell className="text-sm">{fmtShort(tx.transactionAt)}</TableCell>
        <TableCell className="max-w-28 truncate font-medium sm:max-w-64 sm:whitespace-normal sm:line-clamp-2">{tx.description || "—"}</TableCell>
        <TableCell className="hidden md:table-cell">{cat ? <div className="flex items-center gap-2"><IconBadge icon={cat.icon} color={cat.color} size="sm" /><span className="text-sm">{cat.name}</span></div> : <span className="text-muted-foreground">—</span>}</TableCell>
        <TableCell className="hidden lg:table-cell text-sm">{acc?.name ?? "—"}</TableCell>
        <TableCell className="hidden sm:table-cell"><Badge variant={tx.type === "INCOME" ? "default" : "destructive"} className="text-xs">{tx.type === "INCOME" ? "Receita" : "Despesa"}</Badge></TableCell>
        <TableCell className={`text-right font-semibold ${tx.type === "INCOME" ? "text-green-500" : "text-red-500"}`}>{tx.type === "INCOME" ? "+" : "−"}{brl(tx.amountCents)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" aria-label="Editar transação" onClick={(e) => { e.stopPropagation(); onEdit(tx) }}><Pencil className="size-3 text-muted-foreground" /></Button>
            <Button variant="ghost" size="icon-xs" aria-label="Excluir transação" onClick={(e) => { e.stopPropagation(); onDel(tx) }}><Trash2 className="size-3 text-muted-foreground" /></Button>
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}

export function TransactionsPageClient({ familyId }: { familyId: string }) {
  const [search, setSearch] = useState(""); const [debounced, setDebounced] = useState("")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<TransactionSortKey>("transactionAt")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")
  const [gm, setGm] = useState<GroupMode>("list")
  const [fType, setFType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL")
  const [fAcc, setFAcc] = useState("ALL"); const [fCat, setFCat] = useState("ALL")
  const [fDateFrom, setFDateFrom] = useState(""); const [fDateTo, setFDateTo] = useState("")
  const [formOpen, setFormOpen] = useState(false); const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [delOpen, setDelOpen] = useState(false); const [delTx, setDelTx] = useState<Transaction | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleSort = (key: TransactionSortKey) => {
    if (key === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortDir("desc")
    }
    setPage(1)
  }

  const { data: categoriesData } = api.categories.list.useQuery(
    { familyId },
    { enabled: !!familyId },
  )

  const { data: accountsData } = api.accounts.list.useQuery(
    { familyId },
    { enabled: !!familyId },
  )

  const { data: txData } = api.transactions.list.useQuery(
    {
      familyId,
      page,
      pageSize: 20,
      search: debounced || undefined,
      type: fType !== "ALL" ? fType : undefined,
      accountId: fAcc !== "ALL" ? fAcc : undefined,
      categoryId: fCat !== "ALL" ? fCat : undefined,
      dateFrom: fDateFrom || undefined,
      dateTo: fDateTo || undefined,
      orderBy: sortBy,
      orderDir: sortDir,
    },
    { enabled: !!familyId },
  )

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => { setDebounced(search); setPage(1) }, 300)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [search])

  const categories = (categoriesData ?? []) as unknown as Category[]
  const accounts = (accountsData?.accounts ?? []) as unknown as Account[]
  const items = (txData?.items ?? []) as unknown as Transaction[]
  const total = txData?.total ?? 0
  const totalPages = txData?.totalPages ?? 1

  const catMap = useMemo(() => { const m = new Map<string, Category>(); for (const c of categories) m.set(c.id, c); return m }, [categories])
  const accMap = useMemo(() => { const m = new Map<string, Account>(); for (const a of accounts) m.set(a.id, a); return m }, [accounts])

  const groupTotals = useMemo(() => {
    const m = new Map<string, number>()
    if (gm === "list") return m
    for (const tx of items) { const k = gKey(tx, gm); m.set(k, (m.get(k) ?? 0) + tx.amountCents) }
    return m
  }, [items, gm])

  const afc = [fType !== "ALL", fAcc !== "ALL", fCat !== "ALL", !!fDateFrom, !!fDateTo].filter(Boolean).length
  const clearF = () => { setFType("ALL"); setFAcc("ALL"); setFCat("ALL"); setFDateFrom(""); setFDateTo(""); setPage(1) }
  const openCreate = () => { setFormMode("create"); setEditTx(null); setFormOpen(true) }

  if (!txData) return <div className="text-muted-foreground">Carregando...</div>
  const gLabels: Record<string, string> = { list: "Lista", day: "Por dia", week: "Por semana", month: "Por mês", category: "Por categoria" }

  return (
    <>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-primary">Transações</h2>
        <Button size="sm" onClick={openCreate}><Plus className="mr-1 size-3" />Nova transação</Button>
      </section>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-auto"><Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar por descrição..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-full pl-8 sm:w-56" /></div>
          <Select value={gm} onValueChange={(v) => { if (v) { setGm(v as GroupMode); setPage(1) } }}><SelectTrigger size="sm" className="w-full sm:w-auto"><SelectValue>{(v: string | null) => v ? gLabels[v] ?? v : "Lista"}</SelectValue></SelectTrigger><SelectContent>{(["list", "day", "week", "month", "category"] as const).map((g) => <SelectItem key={g} value={g}>{gLabels[g]}</SelectItem>)}</SelectContent></Select>
          <Select value={fType} onValueChange={(v) => { if (v) { setFType(v as typeof fType); setPage(1) } }}><SelectTrigger size="sm" className="w-full sm:w-auto"><SelectValue>{(v: string | null) => v === "ALL" ? "Todos" : v === "INCOME" ? "Receitas" : "Despesas"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="ALL">Todos</SelectItem><SelectItem value="INCOME">Receitas</SelectItem><SelectItem value="EXPENSE">Despesas</SelectItem></SelectContent></Select>
          <Select value={fAcc} onValueChange={(v) => { if (v) { setFAcc(v); setPage(1) } }}><SelectTrigger size="sm" className="w-full sm:w-auto"><SelectValue>{(v: string | null) => v === "ALL" ? "Contas" : accMap.get(v ?? "")?.name ?? (v ?? "")}</SelectValue></SelectTrigger><SelectContent><SelectItem value="ALL">Contas</SelectItem>{accounts.filter((a) => !a.archived).map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select>
          <Select value={fCat} onValueChange={(v) => { if (v) { setFCat(v); setPage(1) } }}><SelectTrigger size="sm" className="w-full sm:w-auto"><SelectValue>{(v: string | null) => v === "ALL" ? "Categorias" : catMap.get(v ?? "")?.name ?? (v ?? "")}</SelectValue></SelectTrigger><SelectContent><SelectItem value="ALL">Categorias</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" value={fDateFrom} onChange={(e) => { setFDateFrom(e.target.value); setPage(1) }} className="h-7 w-full text-xs sm:w-36" />
          <span className="text-xs text-muted-foreground">até</span>
          <Input type="date" value={fDateTo} onChange={(e) => { setFDateTo(e.target.value); setPage(1) }} className="h-7 w-full text-xs sm:w-36" />
          {afc > 0 && <Badge variant="secondary">{afc} filtro{afc > 1 ? "s" : ""} ativo{afc > 1 ? "s" : ""}</Badge>}
          {afc > 0 && <Button variant="ghost" size="sm" onClick={clearF}>Limpar</Button>}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Card><CardContent className="p-0"><Table>
            <TableHeader><TableRow className="hover:bg-transparent">
              <SortableHeader label="Data" columnKey="transactionAt" activeSortBy={sortBy} activeSortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Descrição" columnKey="description" activeSortBy={sortBy} activeSortDir={sortDir} onSort={handleSort} />
              <TableHead className="hidden text-xs font-bold uppercase text-muted-foreground md:table-cell">Categoria</TableHead>
              <TableHead className="hidden text-xs font-bold uppercase text-muted-foreground lg:table-cell">Conta</TableHead>
              <TableHead className="hidden text-xs font-bold uppercase text-muted-foreground sm:table-cell">Tipo</TableHead>
              <SortableHeader label="Valor" columnKey="amountCents" activeSortBy={sortBy} activeSortDir={sortDir} onSort={handleSort} align="right" />
              <TableHead className="w-10 sm:w-16" />
            </TableRow></TableHeader>
            <TableBody>
              {items.length === 0 && <TableRow><TableCell colSpan={7} className="h-16 text-center text-muted-foreground">Nenhuma transação registrada</TableCell></TableRow>}
              {(() => { let last = ""; return items.map((tx) => { const gk = gKey(tx, gm); const show = gk !== last && gm !== "list"; last = gk; const cat = catMap.get(tx.categoryId); const acc = accMap.get(tx.accountId); return <TxRow key={tx.id} tx={tx} cat={cat} acc={acc} showGroup={show} gLabel={gLabel(gk, gm, catMap)} gTotal={groupTotals.get(gk) ?? 0} onEdit={(t) => { setFormMode("edit"); setEditTx(t); setFormOpen(true) }} onDel={(t) => { setDelTx(t); setDelOpen(true) }} /> }) })()}
            </TableBody>
          </Table></CardContent></Card>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="size-4" /> Anterior
              </Button>
              <span className="text-sm text-muted-foreground">{page} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="w-full shrink-0 lg:w-64"><SummarySidebar total={total} totalPages={totalPages} page={page} /></div>
      </div>

      <TxFormDialog mode={formMode} transaction={editTx} accounts={accounts} categories={categories} familyId={familyId} open={formOpen} onOpenChange={setFormOpen} />
      <DeleteDialog open={delOpen} onOpenChange={setDelOpen} txId={delTx?.id ?? ""} familyId={familyId} desc={delTx?.description ?? ""} />
    </>
  )
}
