"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconBadge } from "@/components/ui/icon-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Plus, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";

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

type EditableRow = {
  key: string;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  description: string;
  amountCents: number;
  day: number;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDay(txAt: string): number {
  return new Date(txAt).getDate();
}

function makeRow(tx: Transaction): EditableRow {
  return {
    key: crypto.randomUUID(),
    type: tx.type,
    categoryId: tx.categoryId ?? "",
    description: tx.description,
    amountCents: tx.amountCents,
    day: formatDay(tx.transactionAt),
  };
}

function emptyRow(type: "INCOME" | "EXPENSE"): EditableRow {
  return {
    key: crypto.randomUUID(),
    type,
    categoryId: "",
    description: "",
    amountCents: 0,
    day: new Date().getDate(),
  };
}

function RowEditor({
  row,
  cats,
  categoryMap,
  maxDay,
  onUpdate,
  onDuplicate,
  onRemove,
}: {
  row: EditableRow;
  cats: Category[];
  categoryMap: Map<string, Category>;
  maxDay: number;
  onUpdate: (key: string, patch: Partial<EditableRow>) => void;
  onDuplicate: (key: string) => void;
  onRemove: (key: string) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <Input
          type="number"
          min={1}
          max={maxDay}
          value={row.day}
          onChange={(e) =>
            onUpdate(row.key, { day: Number(e.target.value) || 1 })
          }
          className="h-8 w-16 text-center"
        />
      </TableCell>
      <TableCell>
        <Select
          value={row.categoryId || cats[0]?.id || ""}
          onValueChange={(v) => {
            if (v) onUpdate(row.key, { categoryId: v });
          }}
        >
          <SelectTrigger size="sm" className="h-8">
            <SelectValue>
              {(v: string | null) => {
                if (!v) return "Selecionar";
                const cat = categoryMap.get(v);
                return cat ? cat.name : "Selecionar";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {cats.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <IconBadge icon={cat.icon} color={cat.color} size="sm" />
                  <span>{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          value={row.description}
          onChange={(e) => onUpdate(row.key, { description: e.target.value })}
          placeholder="Descrição"
          className="h-8 min-w-28"
        />
      </TableCell>
      <TableCell>
        <CurrencyInput
          value={row.amountCents}
          onChange={(v) => onUpdate(row.key, { amountCents: v })}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDuplicate(row.key)}
            title="Duplicar"
          >
            <Copy className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(row.key)}
            title="Remover"
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BatchImportDialog({
  open,
  onOpenChange,
  categories,
  previousTransactions,
  selectedMonth,
  familyId,
  accountId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  previousTransactions: Transaction[];
  selectedMonth: string;
  familyId: string;
  accountId: string;
  onSuccess: () => void;
}) {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.kind === "EXPENSE"),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.kind === "INCOME"),
    [categories],
  );

  useEffect(() => {
    if (open && previousTransactions.length > 0) {
      setRows(previousTransactions.map(makeRow));
    }
  }, [open, previousTransactions]);

  useEffect(() => {
    if (!open) {
      setRows([]);
      setSubmitting(false);
    }
  }, [open]);

  const updateRow = useCallback((key: string, patch: Partial<EditableRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }, []);

  const removeRow = useCallback((key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }, []);

  const addRowWithType = useCallback((type: "INCOME" | "EXPENSE") => {
    setRows((prev) => [...prev, emptyRow(type)]);
  }, []);

  const duplicateRow = useCallback((key: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx === -1) return prev;
      const source = prev[idx];
      return [
        ...prev.slice(0, idx + 1),
        { ...source, key: crypto.randomUUID() },
      ];
    });
  }, []);

  const [yearStr, monthStr] = selectedMonth.split("-");
  const targetYear = Number(yearStr);
  const targetMonth = Number(monthStr) - 1;
  const maxDay = daysInMonth(targetYear, targetMonth);

  const clampedRows = useMemo(
    () =>
      rows.map((r) => ({ ...r, day: Math.min(Math.max(1, r.day), maxDay) })),
    [rows, maxDay],
  );

  const sortedRows = useMemo(
    () =>
      [...clampedRows].sort((a, b) => {
        if (a.type !== b.type) return a.type === "EXPENSE" ? -1 : 1;
        return a.day - b.day;
      }),
    [clampedRows],
  );

  const expenseRows = useMemo(
    () => sortedRows.filter((r) => r.type === "EXPENSE"),
    [sortedRows],
  );
  const incomeRows = useMemo(
    () => sortedRows.filter((r) => r.type === "INCOME"),
    [sortedRows],
  );

  const totalIncome = useMemo(
    () =>
      clampedRows
        .filter((r) => r.type === "INCOME")
        .reduce((s, r) => s + r.amountCents, 0),
    [clampedRows],
  );
  const totalExpense = useMemo(
    () =>
      clampedRows
        .filter((r) => r.type === "EXPENSE")
        .reduce((s, r) => s + r.amountCents, 0),
    [clampedRows],
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) map.set(cat.id, cat);
    return map;
  }, [categories]);

  const batchImportMutation = api.transactions.batchImport.useMutation()

  const handleSubmit = async () => {
    const validRows = sortedRows.filter(
      (r) =>
        r.categoryId &&
        r.description.trim().length >= 2 &&
        r.amountCents > 0 &&
        r.day >= 1 &&
        r.day <= maxDay,
    );

    if (validRows.length === 0) {
      toast.error("Adicione ao menos uma transação válida");
      return;
    }

    setSubmitting(true);
    try {
      await batchImportMutation.mutateAsync({
        familyId,
        accountId,
        transactions: validRows.map((r) => ({
          categoryId: r.categoryId,
          type: r.type,
          description: r.description.trim(),
          amountCents: r.amountCents,
          day: Math.min(r.day, maxDay),
        })),
      });

      toast.success(`${validRows.length} transações importadas`);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Não foi possível importar. Verifique os dados.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Importar transações do mês anterior</DialogTitle>
          <DialogDescription>
            Edite, remova ou adicione linhas antes de confirmar a importação.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto space-y-4">
          {expenseRows.length > 0 && (
            <section className="border border-border rounded-md p-2">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold text-muted-foreground">
                  Despesas
                </h4>
                <span className="text-xs font-semibold text-red-500">
                  -
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalExpense / 100)}
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 text-xs font-bold uppercase">
                      Dia
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase">
                      Categoria
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase">
                      Descrição
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold uppercase">
                      Valor
                    </TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseRows.map((row) => (
                    <RowEditor
                      key={row.key}
                      row={row}
                      cats={expenseCategories}
                      categoryMap={categoryMap}
                      maxDay={maxDay}
                      onUpdate={updateRow}
                      onDuplicate={duplicateRow}
                      onRemove={removeRow}
                    />
                  ))}
                </TableBody>
              </Table>
            </section>
          )}

          {incomeRows.length > 0 && (
            <section className="border border-border rounded-md p-2">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold text-muted-foreground">
                  Receitas
                </h4>
                <span className="text-xs font-semibold text-emerald-600">
                  +
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalIncome / 100)}
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 text-xs font-bold uppercase">
                      Dia
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase">
                      Categoria
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase">
                      Descrição
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold uppercase">
                      Valor
                    </TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeRows.map((row) => (
                    <RowEditor
                      key={row.key}
                      row={row}
                      cats={incomeCategories}
                      categoryMap={categoryMap}
                      maxDay={maxDay}
                      onUpdate={updateRow}
                      onDuplicate={duplicateRow}
                      onRemove={removeRow}
                    />
                  ))}
                </TableBody>
              </Table>
            </section>
          )}

          {clampedRows.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma transação para importar
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRowWithType("EXPENSE")}
            >
              <Plus className="size-3.5" />
              Despesa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRowWithType("INCOME")}
            >
              <Plus className="size-3.5" />
              Receita
            </Button>
          </div>
          <div className="flex gap-4 text-sm font-semibold">
            <span className="text-emerald-600">
              +
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalIncome / 100)}
            </span>
            <span className="text-red-500">
              -
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalExpense / 100)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rows.length === 0}
          >
            {submitting
              ? "Importando..."
              : `Importar ${rows.length} transação${rows.length !== 1 ? "ões" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
