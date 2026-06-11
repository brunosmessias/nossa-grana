"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Copy, Minus, PiggyBank, Plus } from "lucide-react"
import { useMonthSelector } from "@/hooks/use-month-selector"
import { formatMonthKey, previousMonthKey } from "@/lib/month-key"
import { api } from "@/trpc/react"
import { Separator } from "@/components/ui/separator"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"
import type { SortDirection, TransactionSortKey } from "@/shared/schemas/transaction"
import { AccountDialog } from "./account-dialog"
import { BatchImportDialog } from "./batch-import-dialog"
import { CategoryDialog } from "./category-dialog"
import { CategoryBreakdown, MonthSummary, type CategoryWithTotal } from "./month-summary"
import { MonthlyView } from "./monthly-view"
import { SavingsDialog } from "./savings-dialog"
import { TransactionDialog } from "./transaction-dialog"
import { useDashboardMutations, type CreateAccountInput, type CreateCategoryInput, type TransactionInput } from "./use-dashboard-mutations"

type Transaction = { id: string; description: string; type: "INCOME" | "EXPENSE"; amountCents: number; transactionAt: string; categoryId: string | null; accountId: string; paid: boolean }

type Account = { id: string; name: string; type: "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT" | "CREDIT_CARD" | "LOAN" | "GOAL"; initialBalanceCents: number; icon: string; color: string; archived: boolean; balanceCents: number }

type Category = { id: string; name: string; kind: "INCOME" | "EXPENSE"; icon: string; color: string }

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number)
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1))
}

function buildMonthRange(monthKey: string) {
  const [yearStr, monthStr] = monthKey.split("-").map(Number)
  const first = new Date(Date.UTC(yearStr, monthStr - 1, 1, 0, 0, 0, 0))
  const lastDay = new Date(Date.UTC(yearStr, monthStr, 0)).getUTCDate()
  const last = new Date(
    Date.UTC(yearStr, monthStr - 1, lastDay, 23, 59, 59, 999),
  )
  return { dateFrom: first.toISOString(), dateTo: last.toISOString() }
}

function FamilyGate() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <span className="text-lg font-semibold">Nenhuma família</span>
          <p className="text-sm text-muted-foreground">
            Você precisa criar uma família primeiro
          </p>
        </CardHeader>
        <CardContent>
          <Button className="w-full" render={<Link href="/onboarding" />}>
            Criar família
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyMonthImportCard({ onImport }: { onImport: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Nenhuma transação neste mês
      </p>
      <Button variant="default" onClick={onImport}>
        <Copy className="size-3.5" />
        Importar do mês anterior
      </Button>
    </div>
  )
}

function DashboardHeader({
  selectedMonth,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: {
  selectedMonth: string
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <section className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
        Transações do mês
      </h2>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" disabled={!canGoPrev} onClick={onPrev}>
          <ChevronLeft className="size-5" />
        </Button>
        <span className="min-w-36 text-center text-sm font-semibold capitalize sm:min-w-44">
          {formatMonthLabel(selectedMonth)}
        </span>
        <Button variant="ghost" size="icon-sm" disabled={!canGoNext} onClick={onNext}>
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </section>
  )
}

function DashboardToolbar({
  onAddIncome,
  onAddExpense,
  onCreateAccount,
  onCreateCategory,
  onOpenSavings,
}: {
  onAddIncome: () => void
  onAddExpense: () => void
  onCreateAccount: (input: CreateAccountInput) => Promise<void>
  onCreateCategory: (input: CreateCategoryInput) => Promise<void>
  onOpenSavings: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="default" onClick={onAddIncome}>
        <Plus className="size-3.5" />
        Receita
        <kbd className="pointer-events-none ml-1 inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">R</kbd>
      </Button>
      <Button size="sm" variant="default" onClick={onAddExpense}>
        <Minus className="size-3.5" />
        Despesa
        <kbd className="pointer-events-none ml-1 inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">E</kbd>
      </Button>
      <Separator orientation="vertical" className="border-border/60 border-l-3 rounded-full" />
      <AccountDialog onSubmit={onCreateAccount} />
      <CategoryDialog onSubmit={onCreateCategory} />
      <Separator orientation="vertical" className="border-border/60 border-l-3 rounded-full" />
      <Button size="sm" onClick={onOpenSavings}>
        <PiggyBank className="size-3.5" />
        Guardar dinheiro
      </Button>
    </div>
  )
}

function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return
      const handler = handlers[event.key]
      if (handler) {
        event.preventDefault()
        handler()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handlers])
}

export function DashboardClient({
  defaultFamilyId,
  familyCreatedMonth,
  navMinMonth,
}: {
  defaultFamilyId: string | null
  familyCreatedMonth?: string | null
  navMinMonth?: string | null
}) {
  const [familyId] = useState(defaultFamilyId ?? "")

  const { selectedMonth, goToNext, goToPrev, canGoNext, canGoPrev } =
    useMonthSelector({
      minMonth: navMinMonth ?? null,
      currentMonthKey: formatMonthKey(new Date()),
    })

  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [txDialogType, setTxDialogType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false)
  const [batchImportOpen, setBatchImportOpen] = useState(false)
  const [sortBy, setSortBy] = useState<TransactionSortKey>("transactionAt")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")

  const handleSort = (key: TransactionSortKey) => {
    if (key === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortDir("desc")
    }
  }

  const enabled = !!familyId

  const { data: accountsData } = api.accounts.list.useQuery({ familyId }, { enabled })
  const { data: categoriesData } = api.categories.list.useQuery({ familyId }, { enabled })

  const monthRange = useMemo(() => buildMonthRange(selectedMonth), [selectedMonth])
  const { data: monthTransactionsData } = api.transactions.list.useQuery(
    {
      familyId,
      page: 1,
      pageSize: 100,
      dateFrom: monthRange.dateFrom,
      dateTo: monthRange.dateTo,
      orderBy: sortBy,
      orderDir: sortDir,
    },
    { enabled },
  )

  const previousRange = useMemo(
    () => buildMonthRange(previousMonthKey(selectedMonth)),
    [selectedMonth],
  )
  const { data: previousMonthTransactionsData } = api.transactions.list.useQuery(
    {
      familyId,
      page: 1,
      pageSize: 100,
      dateFrom: previousRange.dateFrom,
      dateTo: previousRange.dateTo,
    },
    { enabled },
  )

  const invalidate = useInvalidateQueries()
  const accounts = (accountsData?.accounts ?? []) as Account[]
  const categories = (categoriesData ?? []) as Category[]
  const monthTransactions = (monthTransactionsData?.items ?? []) as unknown as Transaction[]
  const previousMonthTransactions = (previousMonthTransactionsData?.items ?? []) as unknown as Transaction[]
  const hasAnyTransaction =
    monthTransactions.length > 0 || previousMonthTransactions.length > 0

  const defaultAccountId = useMemo(() => {
    const checking = accounts.find((a) => a.type === "CHECKING" && !a.archived)
    return checking?.id ?? accounts.find((a) => !a.archived)?.id ?? ""
  }, [accounts])

  const monthIncome = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amountCents, 0),
    [monthTransactions],
  )

  const monthExpense = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amountCents, 0),
    [monthTransactions],
  )

  const monthIncomePaid = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "INCOME" && t.paid)
        .reduce((sum, t) => sum + t.amountCents, 0),
    [monthTransactions],
  )

  const monthExpensePaid = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "EXPENSE" && t.paid)
        .reduce((sum, t) => sum + t.amountCents, 0),
    [monthTransactions],
  )

  const categoryTotals = useMemo((): CategoryWithTotal[] => {
    const map = new Map<string, number>()
    let uncategorizedCents = 0
    for (const tx of monthTransactions) {
      if (tx.type !== "EXPENSE") continue
      if (!tx.categoryId) {
        uncategorizedCents += tx.amountCents
        continue
      }
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amountCents)
    }
    const totals = [...categories]
      .filter((cat) => cat.kind === "EXPENSE")
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        totalCents: map.get(cat.id) ?? 0,
      }))
      .filter((cat) => cat.totalCents > 0)
    if (uncategorizedCents > 0) {
      totals.push({
        id: "uncategorized",
        name: "Sem categoria",
        icon: "wallet",
        color: "#9ca3af",
        totalCents: uncategorizedCents,
      })
    }
    return totals.sort((a, b) => b.totalCents - a.totalCents)
  }, [categories, monthTransactions])

  const {
    createAccount,
    createCategory,
    createTransaction,
    updateTransaction,
    togglePaid,
  } = useDashboardMutations(familyId)

  const handleCreateTransaction = async (txData: TransactionInput) => {
    await createTransaction(txData)
  }

  const handleUpdateTransaction = async (txData: TransactionInput) => {
    if (!editingTx) return
    await updateTransaction(editingTx.id, txData)
  }

  const handleTogglePaid = async (tx: Transaction, next: boolean) => {
    await togglePaid(tx.id, next)
  }

  const openTxDialog = (type: "INCOME" | "EXPENSE") => {
    setEditingTx(null)
    setTxDialogType(type)
    setTxDialogOpen(true)
  }

  const openEditDialog = (tx: Transaction) => {
    setEditingTx(tx)
    setTxDialogOpen(true)
  }

  useKeyboardShortcuts(
    useMemo(
      () => ({
        r: () => openTxDialog("INCOME"),
        e: () => openTxDialog("EXPENSE"),
      }),
      [openTxDialog],
    ),
  )

  if (!defaultFamilyId) {
    return <FamilyGate />
  }

  const showImportCard =
    monthTransactions.length === 0 &&
    previousMonthTransactions.length > 0 &&
    selectedMonth !== (familyCreatedMonth ?? "")

  const openBatchImport = () => {
    if (previousMonthTransactions.length === 0) {
      toast.error("Sem transações no mês anterior para importar")
      return
    }
    setBatchImportOpen(true)
  }

  return (
    <>
      <DashboardHeader
        selectedMonth={selectedMonth}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={goToPrev}
        onNext={goToNext}
      />

      <div className={cn("grid gap-4", categoryTotals.length > 0 && "lg:grid-cols-3")}>
        <MonthSummary
          monthIncome={monthIncome}
          monthIncomePaid={monthIncomePaid}
          monthExpense={monthExpense}
          monthExpensePaid={monthExpensePaid}
          className={categoryTotals.length > 0 ? "lg:col-span-2" : undefined}
        />
        {categoryTotals.length > 0 && (
          <CategoryBreakdown totals={categoryTotals} totalExpenseCents={monthExpense} />
        )}
      </div>

      <DashboardToolbar
        onAddIncome={() => openTxDialog("INCOME")}
        onAddExpense={() => openTxDialog("EXPENSE")}
        onCreateAccount={createAccount}
        onCreateCategory={createCategory}
        onOpenSavings={() => setSavingsDialogOpen(true)}
      />

      <TransactionDialog
        accounts={accounts}
        categories={categories}
        defaultType={txDialogType}
        open={txDialogOpen}
        onOpenChange={(v) => {
          if (!v) setEditingTx(null)
          setTxDialogOpen(v)
        }}
        onSubmit={handleCreateTransaction}
        initialTransaction={editingTx}
        onUpdate={handleUpdateTransaction}
      />

      <SavingsDialog
        accounts={accounts}
        open={savingsDialogOpen}
        onOpenChange={setSavingsDialogOpen}
        onSubmit={async () => {
          toast.error("Funcionalidade de guardar dinheiro ainda não está disponível")
          setSavingsDialogOpen(false)
        }}
      />

      {showImportCard && (
        <BatchImportDialog
          open={batchImportOpen}
          onOpenChange={setBatchImportOpen}
          categories={categories}
          previousTransactions={previousMonthTransactions}
          selectedMonth={selectedMonth}
          familyId={familyId}
          accountId={defaultAccountId}
          onSuccess={async () => {
            await invalidate(["transactions", "accounts"])
          }}
        />
      )}

      {showImportCard && !batchImportOpen && (
        <EmptyMonthImportCard onImport={openBatchImport} />
      )}

      {hasAnyTransaction && (
        <MonthlyView
          transactions={monthTransactions}
          categories={categories}
          onAddTransaction={openTxDialog}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onEditTransaction={openEditDialog}
          onTogglePaid={handleTogglePaid}
        />
      )}
    </>
  )
}
