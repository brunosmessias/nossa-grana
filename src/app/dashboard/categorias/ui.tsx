"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { ChevronLeft, ChevronRight, Plus, Tag } from "lucide-react"
import { api } from "@/trpc/react"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"
import { useMonthSelector } from "@/hooks/use-month-selector"
import { addMonths, formatMonthKey, previousMonthKey } from "@/lib/month-key"
import { CategoryCard, CategoryFormDialog, ExpenseDonutChart, CategoryLineChart, TrendRanking } from "./components"

type Category = {
  id: string; familyId: string; name: string; kind: "INCOME" | "EXPENSE"
  icon: string; color: string; monthlyBudgetCents: number | null
}

type Transaction = {
  id: string; description: string; type: "INCOME" | "EXPENSE"
  amountCents: number; transactionAt: string; categoryId: string | null; accountId: string
}

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number)
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1))
}

export function CategoriesPageClient({ familyId, familyCreatedMonth, navMinMonth }: { familyId: string; familyCreatedMonth?: string | null; navMinMonth?: string | null }) {
  const {
    selectedMonth,
    goToNext,
    goToPrev,
    canGoNext,
    canGoPrev,
  } = useMonthSelector({
    minMonth: navMinMonth ?? null,
    currentMonthKey: formatMonthKey(new Date()),
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [selectedChartCategory, setSelectedChartCategory] = useState<string | null>(null)

  const { data: categoriesData } = api.categories.list.useQuery(
    { familyId },
    { enabled: !!familyId },
  )

  const { data: transactionsData } = api.transactions.listAll.useQuery(
    { familyId },
    { enabled: !!familyId },
  )

  const invalidate = useInvalidateQueries()

  const transactions = (transactionsData ?? []) as unknown as Transaction[]
  const categories = (categoriesData ?? []) as unknown as Category[]

  const minMonth = familyCreatedMonth ?? null
  const prevMonth = minMonth !== null && selectedMonth === minMonth ? null : previousMonthKey(selectedMonth)

  const monthTx = useMemo(
    () => transactions.filter((t) => formatMonthKey(new Date(t.transactionAt)) === selectedMonth),
    [transactions, selectedMonth],
  )

  const prevMonthTx = useMemo(
    () => prevMonth ? transactions.filter((t) => formatMonthKey(new Date(t.transactionAt)) === prevMonth) : [],
    [transactions, prevMonth],
  )

  const categorySpent = useMemo(() => {
    const map = new Map<string, number>()
    for (const tx of monthTx) { if (!tx.categoryId) continue; map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amountCents) }
    return map
  }, [monthTx])

  const prevCategorySpent = useMemo(() => {
    const map = new Map<string, number>()
    for (const tx of prevMonthTx) { if (!tx.categoryId) continue; map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amountCents) }
    return map
  }, [prevMonthTx])

  const expenseCategories = categories.filter((c) => c.kind === "EXPENSE")
  const incomeCategories = categories.filter((c) => c.kind === "INCOME")

  const createCategoryMutation = api.categories.create.useMutation({
    onSuccess: () => { void invalidate(["categories"]) },
    onError: () => { toast.error("Falha ao criar categoria") },
  })

  const handleCreate = async (input: { name: string; kind: "INCOME" | "EXPENSE"; icon: string; color: string; monthlyBudgetCents?: number }) => {
    await createCategoryMutation.mutateAsync({ familyId, ...input })
    setCreateOpen(false)
  }

  const updateCategoryMutation = api.categories.update.useMutation({
    onSuccess: () => { void invalidate(["categories"]) },
    onError: () => { toast.error("Falha ao atualizar categoria") },
  })

  const handleUpdate = async (input: { categoryId: string; name?: string; icon?: string; color?: string; monthlyBudgetCents?: number }) => {
    await updateCategoryMutation.mutateAsync({ familyId, ...input })
    setEditCategory(null)
  }

  const lineChartData = useMemo(() => {
    if (!selectedChartCategory) return []
    const months = Array.from({ length: 6 }, (_, k) => addMonths(selectedMonth, -k)).reverse()
    return months.map((mk) => {
      const [y, m] = mk.split("-").map(Number)
      const total = transactions.filter((t) => t.categoryId === selectedChartCategory && formatMonthKey(new Date(t.transactionAt)) === mk).reduce((s, t) => s + t.amountCents, 0)
      const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(y, m - 1, 1))
      return { month: label, total }
    })
  }, [selectedChartCategory, transactions, selectedMonth])

  const selectedCat = selectedChartCategory ? categories.find((c) => c.id === selectedChartCategory) : null

  if (!categoriesData || !transactionsData) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Carregando...</p></div>

  return (
    <div className="space-y-6">
      <section className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">Categorias</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" disabled={!canGoPrev} onClick={goToPrev}><ChevronLeft className="size-5" /></Button>
            <span className="min-w-36 text-center text-sm font-semibold capitalize sm:min-w-44">{formatMonthLabel(selectedMonth)}</span>
            <Button variant="ghost" size="icon-sm" disabled={!canGoNext} onClick={goToNext}><ChevronRight className="size-5" /></Button>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1 size-3" /> Nova categoria</Button>
        </div>
      </section>

      {expenseCategories.length > 0 && monthTx.length > 0 && (
        <ExpenseDonutChart categories={expenseCategories} categorySpent={categorySpent} onSelectCategory={setSelectedChartCategory} />
      )}

      {selectedChartCategory && selectedCat && (
        <Card className="border-border/50 p-4">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex min-w-0 items-center gap-2"><div className="size-3 shrink-0 rounded-full" style={{ backgroundColor: selectedCat.color }} /><span className="truncate text-sm font-semibold">{selectedCat.name} — últimos 6 meses</span></div>
            <Button variant="ghost" size="icon-xs" onClick={() => setSelectedChartCategory(null)}>✕</Button>
          </CardHeader>
          <CardContent><CategoryLineChart data={lineChartData} color={selectedCat.color} /></CardContent>
        </Card>
      )}

      {prevMonth && expenseCategories.length > 0 && (
        <TrendRanking categories={expenseCategories} categorySpent={categorySpent} prevCategorySpent={prevCategorySpent} />
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Despesas</h3>
        {expenseCategories.length === 0 ? (
          <Card className="border-border/50"><CardContent className="flex flex-col items-center gap-3 py-8 text-center"><Tag className="size-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Nenhuma categoria de despesa cadastrada</p><Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1 size-3" /> Criar categoria</Button></CardContent></Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((cat) => <CategoryCard key={cat.id} category={cat} spent={categorySpent.get(cat.id) ?? 0} prevSpent={prevMonth ? (prevCategorySpent.get(cat.id) ?? 0) : undefined} brl={brl} onEdit={(c) => setEditCategory(c as Category)} />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Receitas</h3>
        {incomeCategories.length === 0 ? (
          <Card className="border-border/50"><CardContent className="flex flex-col items-center gap-3 py-8 text-center"><Tag className="size-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Nenhuma categoria de receita cadastrada</p><Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1 size-3" /> Criar categoria</Button></CardContent></Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((cat) => <CategoryCard key={cat.id} category={cat} spent={categorySpent.get(cat.id) ?? 0} brl={brl} onEdit={(c) => setEditCategory(c as Category)} />)}
          </div>
        )}
      </section>

      <CategoryFormDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={async (input) => { await handleCreate({ name: input.name, kind: input.kind ?? "EXPENSE", icon: input.icon ?? "tag", color: input.color ?? "#1866e4", monthlyBudgetCents: input.monthlyBudgetCents }) }} title="Nova categoria" description="Organize suas transações por categoria" />
      {editCategory && (
        <CategoryFormDialog open={!!editCategory} onOpenChange={(open) => { if (!open) setEditCategory(null) }} onSubmit={async (input) => { await handleUpdate({ categoryId: editCategory.id, ...input }) }} title="Editar categoria" description="Altere os dados da categoria" defaultValues={editCategory} />
      )}
    </div>
  )
}
