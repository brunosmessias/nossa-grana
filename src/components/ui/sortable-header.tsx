"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortDirection, TransactionSortKey } from "@/shared/schemas/transaction";

export type { SortDirection, TransactionSortKey } from "@/shared/schemas/transaction";

export function SortableHeader({
  label,
  columnKey,
  activeSortBy,
  activeSortDir,
  onSort,
  align = "left",
  className,
}: {
  label: string;
  columnKey: TransactionSortKey;
  activeSortBy: TransactionSortKey;
  activeSortDir: SortDirection;
  onSort: (key: TransactionSortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const isActive = columnKey === activeSortBy;
  const Icon = isActive
    ? activeSortDir === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <TableHead
      className={cn(
        "text-xs font-bold uppercase text-muted-foreground",
        align === "right" ? "text-right" : "text-left",
        "cursor-pointer select-none",
        className,
      )}
      onClick={() => onSort(columnKey)}
      aria-sort={
        isActive
          ? activeSortDir === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <span
        className={cn(
          "inline-flex items-center gap-1",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <Icon
          className={cn(
            "size-3.5",
            isActive ? "text-foreground" : "text-muted-foreground/40",
          )}
        />
      </span>
    </TableHead>
  );
}
