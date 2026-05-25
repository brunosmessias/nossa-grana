"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

import { Separator } from "@/components/ui/separator";
import { AccountDialog } from "./account-dialog";
import { BatchImportDialog } from "./batch-import-dialog";
import { CategoryDialog } from "./category-dialog";
import { MonthlyView } from "./monthly-view";
import { SavingsDialog } from "./savings-dialog";
import { TransactionDialog } from "./transaction-dialog";

type Account = {
  id: string;
  familyId: string;
  name: string;
  type:
    | "CHECKING"
    | "SAVINGS"
    | "CASH"
    | "INVESTMENT"
    | "CREDIT_CARD"
    | "LOAN"
    | "GOAL";
  icon: string;
  color: string;
  initialBalanceCents: number;
  archived: boolean;
  balanceCents: number;
};

type Category = {
  id: string;
  name: string;
  kind: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
};

type Transaction = {
  id: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  transactionAt: string;
  categoryId: string | null;
};

type BootstrapPayload = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  members: Array<{ userId: string; role: string }>;
  invites: Array<{ id: string; email: string; status: string }>;
  summary: { totalBalanceCents: number };
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
  const [data, setData] = useState<BootstrapPayload | null>(null);

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

  const refresh = async () => {
    if (!familyId) {
      setData(null);
      return;
    }

    const response = await fetch(`/api/mvp/bootstrap?familyId=${familyId}`);
    const payload = (await response.json()) as
      | BootstrapPayload
      | { message: string };

    if (!response.ok) {
      toast.error("Erro ao carregar dashboard");
      return;
    }

    const boot = payload as BootstrapPayload;
    setData(boot);
    setAvailableMonths(getAvailableMonths(boot.transactions));
  };

  useEffect(() => {
    void refresh();
  }, [familyId]);

  const defaultAccountId = useMemo(() => {
    const checking = data?.accounts.find(
      (a) => a.type === "CHECKING" && !a.archived,
    );
    return (
      checking?.id ??
      data?.accounts.find((a) => !a.archived)?.id ??
      ""
    );
  }, [data?.accounts]);

  const previousMonthTransactions = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split("-").map(Number);
    const date = new Date(yearStr, monthStr - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const prevKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return (
      data?.transactions.filter(
        (tx) => getMonthKey(new Date(tx.transactionAt)) === prevKey,
      ) ?? []
    );
  }, [data?.transactions, selectedMonth]);

  const currentIdx = availableMonths.indexOf(selectedMonth);

  const monthTransactions = useMemo(
    () =>
      data?.transactions.filter(
        (tx) => getMonthKey(new Date(tx.transactionAt)) === selectedMonth,
      ) ?? [],
    [data?.transactions, selectedMonth],
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

  type CategoryWithTotal = Category & { totalCents: number };

  const categoryTotals = useMemo((): CategoryWithTotal[] => {
    if (!data) return [];
    const map = new Map<string, number>();
    for (const tx of monthTransactions) {
      if (!tx.categoryId) continue;
      if (tx.type !== "EXPENSE") continue;
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amountCents);
    }
    return [...data.categories]
      .filter((cat) => cat.kind === "EXPENSE")
      .map((cat) => ({ ...cat, totalCents: map.get(cat.id) ?? 0 }))
      .filter((cat) => cat.totalCents > 0)
      .sort((a, b) => b.totalCents - a.totalCents);
  }, [data, monthTransactions]);

  const createAccount = async (input: {
    name: string;
    type: Account["type"];
    initialBalanceCents: number;
    icon: string;
    color: string;
  }) => {
    const response = await fetch("/api/mvp/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyId, ...input, archived: false }),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar conta");
    }

    await refresh();
  };

  const createCategory = async (input: {
    name: string;
    kind: Category["kind"];
    icon: string;
    color: string;
  }) => {
    const response = await fetch("/api/mvp/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyId, ...input }),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar categoria");
    }

    await refresh();
  };

  const handleCreateTransaction = async (txData: {
    accountId: string;
    categoryId: string;
    type: "INCOME" | "EXPENSE";
    description: string;
    amountCents: number;
    transactionAt: string;
  }) => {
    const response = await fetch("/api/mvp/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyId, ...txData }),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar transação");
    }

    await refresh();
  };

  const openTxDialog = useCallback((type: "INCOME" | "EXPENSE") => {
    setTxDialogType(type);
    setTxDialogOpen(true);
  }, []);

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
  }, [openTxDialog]);

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
              {data ? brl(monthBalance) : "—"}
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-border/60 p-2">
          <CardHeader className="text-lg font-bold text-primary">
            Saldo total
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {data ? brl(data.summary.totalBalanceCents) : "—"}
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
        accounts={data?.accounts ?? []}
        categories={data?.categories ?? []}
        defaultType={txDialogType}
        open={txDialogOpen}
        onOpenChange={setTxDialogOpen}
        onSubmit={handleCreateTransaction}
      />

      <SavingsDialog
        accounts={data?.accounts ?? []}
        open={savingsDialogOpen}
        onOpenChange={setSavingsDialogOpen}
        onSubmit={async () => {
          toast.error(
            "Funcionalidade de guardar dinheiro ainda não está disponível",
          );
          setSavingsDialogOpen(false);
        }}
      />

      {data && monthTransactions.length === 0 && previousMonthTransactions.length > 0 && (
        <BatchImportDialog
          open={batchImportOpen}
          onOpenChange={setBatchImportOpen}
          categories={data.categories}
          previousTransactions={previousMonthTransactions}
          selectedMonth={selectedMonth}
          familyId={familyId}
          accountId={defaultAccountId}
          onSuccess={refresh}
        />
      )}

      {data && monthTransactions.length === 0 && previousMonthTransactions.length > 0 && !batchImportOpen && (
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

      {data && (
        <MonthlyView
          transactions={monthTransactions}
          categories={data.categories}
          onAddTransaction={openTxDialog}
        />
      )}
    </>
  );
}
