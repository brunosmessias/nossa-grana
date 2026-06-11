"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/ui/sortable-header";
import type { SortDirection, TransactionSortKey } from "@/shared/schemas/transaction";
import { Plus, Pencil } from "lucide-react";

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
  accountId: string;
  paid: boolean;
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
  sortBy,
  sortDir,
  onSort,
  onEdit,
  onTogglePaid,
  pendingRowId,
  onOptimisticPaid,
}: {
  title: string;
  transactions: Transaction[];
  totalCents: number;
  valueColor: string;
  categoryMap: Map<string, Category>;
  onAdd: () => void;
  sortBy: TransactionSortKey;
  sortDir: SortDirection;
  onSort: (key: TransactionSortKey) => void;
  onEdit?: (tx: Transaction) => void;
  onTogglePaid?: (tx: Transaction, next: boolean) => Promise<void> | void;
  pendingRowId?: string | null;
  onOptimisticPaid?: (txId: string, next: boolean) => void;
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
            {onTogglePaid && (
              <TableHead className="w-10 text-xs font-bold uppercase text-muted-foreground">
                Pago
              </TableHead>
            )}
            <SortableHeader
              label="Data"
              columnKey="transactionAt"
              activeSortBy={sortBy}
              activeSortDir={sortDir}
              onSort={onSort}
            />
            <SortableHeader
              label="Descrição"
              columnKey="description"
              activeSortBy={sortBy}
              activeSortDir={sortDir}
              onSort={onSort}
            />
            <TableHead className="hidden text-xs font-bold uppercase text-muted-foreground sm:table-cell">
              Categoria
            </TableHead>
            <SortableHeader
              label="Valor"
              columnKey="amountCents"
              activeSortBy={sortBy}
              activeSortDir={sortDir}
              onSort={onSort}
              align="right"
            />
            {onEdit && <TableHead className="w-8" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={onTogglePaid ? (onEdit ? 6 : 5) : onEdit ? 5 : 4}
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
            const isPending = pendingRowId === tx.id;
            return (
              <TableRow
                key={tx.id}
                className={`group ${isPending ? "pointer-events-none opacity-50" : ""}`}
              >
                {onTogglePaid && (
                  <TableCell>
                    <Checkbox
                      checked={tx.paid}
                      disabled={isPending}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={(value) => {
                        const next = value === true;
                        onOptimisticPaid?.(tx.id, next);
                        onTogglePaid?.(tx, next);
                      }}
                      aria-label={tx.paid ? "Marcar como pendente" : "Marcar como pago"}
                    />
                  </TableCell>
                )}
                <TableCell className="text-sm font-medium">
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  }).format(date)}
                </TableCell>
                <TableCell className="max-w-28 truncate font-medium sm:max-w-64 sm:whitespace-normal sm:line-clamp-2">
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
                {onEdit && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Editar transação"
                      className="opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(tx);
                      }}
                    >
                      <Pencil className="size-3 text-muted-foreground" />
                    </Button>
                  </TableCell>
                )}
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
  sortBy,
  sortDir,
  onSort,
  onEditTransaction,
  onTogglePaid,
}: {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: (type: "INCOME" | "EXPENSE") => void;
  sortBy: TransactionSortKey;
  sortDir: SortDirection;
  onSort: (key: TransactionSortKey) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onTogglePaid?: (tx: Transaction, next: boolean) => Promise<void>;
}) {
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [optimisticPaid, setOptimisticPaid] = useState<
    Map<string, boolean> | null
  >(null);

  const baseTransactions = useMemo(() => {
    if (!optimisticPaid) return transactions;
    return transactions.map((tx) => {
      const override = optimisticPaid.get(tx.id);
      return override === undefined ? tx : { ...tx, paid: override };
    });
  }, [transactions, optimisticPaid]);

  const applyOptimistic = (txId: string, next: boolean) => {
    setOptimisticPaid((prev) => {
      const map = new Map(prev ?? []);
      map.set(txId, next);
      return map;
    });
  };

  const clearOptimistic = (txId: string) => {
    setOptimisticPaid((prev) => {
      if (!prev) return prev;
      const map = new Map(prev);
      map.delete(txId);
      return map;
    });
  };

  const handleTogglePaid = async (
    tx: Transaction,
    next: boolean,
  ) => {
    if (!onTogglePaid) return;
    setPendingRowId(tx.id);
    try {
      await onTogglePaid(tx, next);
    } catch {
      // Caller surfaced the error via toast. Clear the override so the
      // row reverts to the last server-known value.
    } finally {
      clearOptimistic(tx.id);
      setPendingRowId(null);
    }
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  const expenses = useMemo(
    () => baseTransactions.filter((t) => t.type === "EXPENSE"),
    [baseTransactions],
  );

  const incomes = useMemo(
    () => baseTransactions.filter((t) => t.type === "INCOME"),
    [baseTransactions],
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
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
          onEdit={onEditTransaction}
          onTogglePaid={handleTogglePaid}
          pendingRowId={pendingRowId}
          onOptimisticPaid={applyOptimistic}
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
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
          onEdit={onEditTransaction}
          onTogglePaid={handleTogglePaid}
          pendingRowId={pendingRowId}
          onOptimisticPaid={applyOptimistic}
        />
      </div>
    </div>
  );
}
