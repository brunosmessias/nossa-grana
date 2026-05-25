"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { toast } from "@/components/ui/sonner";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Minus,
  PiggyBank,
  Plus,
} from "lucide-react";

import { api } from "@/trpc/react";
import { Separator } from "@/components/ui/separator";
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries";
import { AccountDialog } from "./account-dialog";
import { BatchImportDialog } from "./batch-import-dialog";
import { CategoryDialog } from "./category-dialog";
import { MonthlyView } from "./monthly-view";
import { SavingsDialog } from "./savings-dialog";
import { TransactionDialog } from "./transaction-dialog";

type Transaction = {
  id: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  transactionAt: string;
  categoryId: string | null;
};

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function getAvailableMonths(transactions: Transaction[]): string[] {
  const months = new Set<string>();
  const now = new Date();
  months.add(getMonthKey(now));

  for (const tx of transactions) {
    months.add(getMonthKey(new Date(tx.transactionAt)));
  }

  return Array.from(months).sort().reverse();
}

export function DashboardClient({
  defaultFamilyId,
}: {
  defaultFamilyId: string | null;
}) {
  const [familyId] = useState(defaultFamilyId ?? "");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getMonthKey(new Date()),
  );

  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txDialogType, setTxDialogType] = useState<"INCOME" | "EXPENSE">(
    "EXPENSE",
  );
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false);
  const [batchImportOpen, setBatchImportOpen] = useState(false);

  const enabled = !!familyId;

  const { data: accountsData } = api.accounts.list.useQuery(
    { familyId },
    { enabled },
  );

  const { data: categoriesData } = api.categories.list.useQuery(
    { familyId },
    { enabled },
  );

  const { data: transactionsData } = api.transactions.listAll.useQuery(
    { familyId },
    { enabled },
  );

  const invalidate = useInvalidateQueries();

  const accounts = accountsData?.accounts ?? [];
  const categories = categoriesData ?? [];
  const transactions = (transactionsData ?? []) as unknown as Transaction[];
  const totalBalanceCents = accountsData?.totalBalanceCents ?? 0;

  useEffect(() => {
    if (transactions.length > 0) {
      setAvailableMonths(getAvailableMonths(transactions));
    }
  }, [transactions]);

  const defaultAccountId = useMemo(() => {
    const checking = accounts.find(
      (a) => a.type === "CHECKING" && !a.archived,
    );
    return (
      checking?.id ??
      accounts.find((a) => !a.archived)?.id ??
      ""
    );
  }, [accounts]);

  const previousMonthTransactions = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split("-").map(Number);
    const date = new Date(yearStr, monthStr - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const prevKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return (
      transactions.filter(
        (tx) => getMonthKey(new Date(tx.transactionAt)) === prevKey,
      ) ?? []
    );
  }, [transactions, selectedMonth]);

  const currentIdx = availableMonths.indexOf(selectedMonth);

  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (tx) => getMonthKey(new Date(tx.transactionAt)) === selectedMonth,
      ) ?? [],
    [transactions, selectedMonth],
  );

  const monthIncome = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amountCents, 0),
    [monthTransactions],
  );

  const monthExpense = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amountCents, 0),
    [monthTransactions],
  );

  const monthBalance = monthIncome - monthExpense;

  type CategoryWithTotal = typeof categories[number] & { totalCents: number };

  const categoryTotals = useMemo((): CategoryWithTotal[] => {
    const map = new Map<string, number>();
    for (const tx of monthTransactions) {
      if (!tx.categoryId) continue;
      if (tx.type !== "EXPENSE") continue;
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amountCents);
    }
    return [...categories]
      .filter((cat) => cat.kind === "EXPENSE")
      .map((cat) => ({ ...cat, totalCents: map.get(cat.id) ?? 0 }))
      .filter((cat) => cat.totalCents > 0)
      .sort((a, b) => b.totalCents - a.totalCents);
  }, [categories, monthTransactions]);

  const createAccountMutation = api.accounts.upsert.useMutation({
    onSuccess: () => { void invalidate(["accounts"]) },
    onError: () => { toast.error("Falha ao criar conta") },
  });

  const createAccount = async (input: {
    name: string;
    type: typeof accounts[number]["type"];
    initialBalanceCents: number;
    icon: string;
    color: string;
  }) => {
    await createAccountMutation.mutateAsync({ familyId, ...input, archived: false });
  };

  const createCategoryMutation = api.categories.create.useMutation({
    onSuccess: () => { void invalidate(["categories"]) },
    onError: () => { toast.error("Falha ao criar categoria") },
  });

  const createCategory = async (input: {
    name: string;
    kind: typeof categories[number]["kind"];
    icon: string;
    color: string;
  }) => {
    await createCategoryMutation.mutateAsync({ familyId, ...input });
  };

  const createTransactionMutation = api.transactions.create.useMutation({
    onSuccess: () => { void invalidate(["transactions", "accounts"]) },
    onError: () => { toast.error("Falha ao criar transação") },
  });

  const handleCreateTransaction = async (txData: {
    accountId: string;
    categoryId: string;
    type: "INCOME" | "EXPENSE";
    description: string;
    amountCents: number;
    transactionAt: string;
  }) => {
    await createTransactionMutation.mutateAsync({ familyId, ...txData });
  };

  const openTxDialog = (type: "INCOME" | "EXPENSE") => {
    setTxDialogType(type);
    setTxDialogOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;

      if (event.key === "r") {
        event.preventDefault();
        openTxDialog("INCOME");
      }
      if (event.key === "e") {
        event.preventDefault();
        openTxDialog("EXPENSE");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!defaultFamilyId) {
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
    );
  }

  return (
    <>
      <section className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
          Transações do mês
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={currentIdx >= availableMonths.length - 1}
            onClick={() => setSelectedMonth(availableMonths[currentIdx + 1])}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <span className="min-w-36 text-center text-sm font-semibold capitalize sm:min-w-44">
            {availableMonths.length > 0 ? formatMonthLabel(selectedMonth) : "—"}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={currentIdx <= 0}
            onClick={() => setSelectedMonth(availableMonths[currentIdx - 1])}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-border/60 p-2">
          <CardHeader className="text-lg font-bold text-primary">
            Saldo do mês
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {brl(monthBalance)}
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-border/60 p-2">
          <CardHeader className="text-lg font-bold text-primary">
            Saldo total
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {brl(totalBalanceCents)}
            </span>
          </CardContent>
        </Card>
      </div>

      {categoryTotals.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Gastos por categoria
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categoryTotals.map((cat) => (
              <Card key={cat.id} className="border-border/50 p-3">
                <div className="flex items-center gap-2.5">
                  <IconBadge icon={cat.icon} color={cat.color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-muted-foreground">
                      {cat.name}
                    </p>
                    <p className="text-sm font-bold">{brl(cat.totalCents)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => openTxDialog("INCOME")}
        >
          <Plus className="size-3.5" />
          Receita
          <kbd className="pointer-events-none ml-1 inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
            R
          </kbd>
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => openTxDialog("EXPENSE")}
        >
          <Minus className="size-3.5" />
          Despesa
          <kbd className="pointer-events-none ml-1 inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
            E
          </kbd>
        </Button>

        <Separator
          orientation="vertical"
          className="border-border/60 border-l-3 rounded-full"
        ></Separator>

        <AccountDialog onSubmit={createAccount} />
        <CategoryDialog onSubmit={createCategory} />

        <Separator
          orientation="vertical"
          className="border-border/60 border-l-3 rounded-full"
        ></Separator>

        <Button size="sm" onClick={() => setSavingsDialogOpen(true)}>
          <PiggyBank className="size-3.5"></PiggyBank>
          Guardar dinheiro
        </Button>
      </div>

      <TransactionDialog
        accounts={accounts}
        categories={categories}
        defaultType={txDialogType}
        open={txDialogOpen}
        onOpenChange={setTxDialogOpen}
        onSubmit={handleCreateTransaction}
      />

      <SavingsDialog
        accounts={accounts}
        open={savingsDialogOpen}
        onOpenChange={setSavingsDialogOpen}
        onSubmit={async () => {
          toast.error(
            "Funcionalidade de guardar dinheiro ainda não está disponível",
          );
          setSavingsDialogOpen(false);
        }}
      />

      {transactions.length > 0 && monthTransactions.length === 0 && previousMonthTransactions.length > 0 && (
        <BatchImportDialog
          open={batchImportOpen}
          onOpenChange={setBatchImportOpen}
          categories={categories}
          previousTransactions={previousMonthTransactions}
          selectedMonth={selectedMonth}
          familyId={familyId}
          accountId={defaultAccountId}
          onSuccess={async () => { await invalidate(["transactions", "accounts"]) }}
        />
      )}

      {transactions.length > 0 && monthTransactions.length === 0 && previousMonthTransactions.length > 0 && !batchImportOpen && (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma transação neste mês
          </p>
          <Button variant="default" onClick={() => setBatchImportOpen(true)}>
            <Copy className="size-3.5" />
            Importar do mês anterior
          </Button>
        </div>
      )}

      {transactions.length > 0 && (
        <MonthlyView
          transactions={monthTransactions}
          categories={categories}
          onAddTransaction={openTxDialog}
        />
      )}
    </>
  );
}
