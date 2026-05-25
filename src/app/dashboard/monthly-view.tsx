"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

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

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function TransactionSection({
  title,
  transactions,
  totalCents,
  valueColor,
  categoryMap,
  onAdd,
}: {
  title: string;
  transactions: Transaction[];
  totalCents: number;
  valueColor: string;
  categoryMap: Map<string, Category>;
  onAdd: () => void;
}) {
  return (
    <section className="w-full rounded-md border-2 border-border/60 p-4 bg-white dark:bg-muted/10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-2xl font-bold text-muted-foreground">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm font-semibold">
            {brl(totalCents)}
          </Badge>
          <Button variant="default" size="icon-xs" onClick={onAdd}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-bold uppercase text-muted-foreground">
              Data
            </TableHead>
            <TableHead className="text-xs font-bold uppercase text-muted-foreground">
              Descrição
            </TableHead>
            <TableHead className="hidden text-xs font-bold uppercase text-muted-foreground sm:table-cell">
              Categoria
            </TableHead>
            <TableHead className="text-right text-xs font-bold uppercase text-muted-foreground">
              Valor
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-16 text-center text-sm text-muted-foreground"
              >
                Nenhuma transação encontrada
              </TableCell>
            </TableRow>
          )}
          {transactions.map((tx) => {
            const date = new Date(tx.transactionAt);
            const category = tx.categoryId
              ? categoryMap.get(tx.categoryId)
              : null;
            return (
              <TableRow key={tx.id}>
                <TableCell className="text-sm font-medium">
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  }).format(date)}
                </TableCell>
                <TableCell className="max-w-28 truncate font-medium sm:max-w-none">
                  {tx.description || "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {category ? (
                    <div className="flex items-center gap-2">
                      <IconBadge icon={category.icon} color={category.color} />
                      <span className="text-sm">{category.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className={`text-right font-semibold ${valueColor}`}>
                  {brl(tx.amountCents)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

export function MonthlyView({
  transactions,
  categories,
  onAddTransaction,
}: {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: (type: "INCOME" | "EXPENSE") => void;
}) {
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  const expenses = useMemo(
    () => transactions.filter((t) => t.type === "EXPENSE"),
    [transactions],
  );

  const incomes = useMemo(
    () => transactions.filter((t) => t.type === "INCOME"),
    [transactions],
  );

  const expenseTotal = useMemo(
    () => expenses.reduce((sum, t) => sum + t.amountCents, 0),
    [expenses],
  );

  const incomeTotal = useMemo(
    () => incomes.reduce((sum, t) => sum + t.amountCents, 0),
    [incomes],
  );

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <div className="w-full">
        <TransactionSection
          title="Despesas"
          transactions={expenses}
          totalCents={expenseTotal}
          valueColor="text-foreground"
          categoryMap={categoryMap}
          onAdd={() => onAddTransaction("EXPENSE")}
        />
      </div>

      <div className="w-full">
        <TransactionSection
          title="Renda"
          transactions={incomes}
          totalCents={incomeTotal}
          valueColor="text-foreground"
          categoryMap={categoryMap}
          onAdd={() => onAddTransaction("INCOME")}
        />
      </div>
    </div>
  );
}
