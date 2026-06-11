"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

export type CategoryWithTotal = {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalCents: number;
};

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function ProgressBar({
  value,
  className,
  barClassName,
  color,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300",
          barClassName,
        )}
        style={{
          width: `${pct}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
}

export function MonthSummary({
  monthIncome,
  monthIncomePaid,
  monthExpense,
  monthExpensePaid,
  className,
}: {
  monthIncome: number;
  monthIncomePaid: number;
  monthExpense: number;
  monthExpensePaid: number;
  className?: string;
}) {
  const balanceReal = monthIncomePaid - monthExpensePaid;
  const balancePlanned = monthIncome - monthExpense;
  const pendingIncome = monthIncome - monthIncomePaid;
  const pendingExpense = monthExpense - monthExpensePaid;
  const incomePct =
    monthIncome > 0 ? Math.round((monthIncomePaid / monthIncome) * 100) : 0;
  const expensePct =
    monthExpense > 0 ? Math.round((monthExpensePaid / monthExpense) * 100) : 0;

  return (
    <Card className={cn("border-2 border-border/60 py-0", className)}>
      <CardContent className="grid divide-y divide-border/60 px-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="size-3.5 text-emerald-500" />
            Receitas
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {brl(monthIncomePaid)}
          </p>
          <ProgressBar value={incomePct} barClassName="bg-emerald-500" />
          <p className="text-xs text-muted-foreground">
            {incomePct}% de {brl(monthIncome)} previstos
            {pendingIncome > 0 && (
              <>
                {" · "}
                <span className="font-medium text-foreground/80">
                  {brl(pendingIncome)} a receber
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <TrendingDown className="size-3.5 text-rose-500" />
            Despesas
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {brl(monthExpensePaid)}
          </p>
          <ProgressBar value={expensePct} barClassName="bg-rose-500" />
          <p className="text-xs text-muted-foreground">
            {expensePct}% de {brl(monthExpense)} previstos
            {pendingExpense > 0 && (
              <>
                {" · "}
                <span className="font-medium text-foreground/80">
                  {brl(pendingExpense)} a pagar
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Wallet className="size-3.5 text-primary" />
            Saldo do mês
          </div>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums",
              balanceReal >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {brl(balanceReal)}
          </p>
          <p className="text-xs text-muted-foreground">
            previsto ao fim do mês:{" "}
            <span
              className={cn(
                "font-semibold",
                balancePlanned >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {brl(balancePlanned)}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryBreakdown({
  totals,
  totalExpenseCents,
  className,
}: {
  totals: CategoryWithTotal[];
  totalExpenseCents: number;
  className?: string;
}) {
  if (totals.length === 0) return null;
  const maxCents = totals[0].totalCents;
  return (
    <Card
      className={cn(
        "border-2 border-border/60 gap-3 max-h-30 overflow-auto",
        className,
      )}
    >
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Gastos por categoria
        </CardTitle>
        <Badge variant="outline" className="text-xs font-semibold">
          {brl(totalExpenseCents)}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {totals.map((cat) => {
          const sharePct =
            totalExpenseCents > 0
              ? (cat.totalCents / totalExpenseCents) * 100
              : 0;
          return (
            <div key={cat.id} className="flex items-center gap-3">
              <IconBadge icon={cat.icon} color={cat.color} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium">{cat.name}</p>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {brl(cat.totalCents)}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <ProgressBar
                    value={maxCents > 0 ? (cat.totalCents / maxCents) * 100 : 0}
                    color={cat.color}
                    className="h-1 flex-1"
                  />
                  <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                    {sharePct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
