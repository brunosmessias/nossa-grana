"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react"
import { type RouterOutputs } from "@/src/trpc/react"
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table"
import { Button } from "@heroui/button"
import { Chip } from "@heroui/chip"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown"
import { Checkbox } from "@heroui/checkbox"
import { Spinner } from "@heroui/spinner"
import { Pagination } from "@heroui/pagination"
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/table-core"
import { flexRender, useReactTable } from "@tanstack/react-table"
import MobileTransactionCard from "@/src/app/_components/page/dashboard/mobileTransactionsTable"
import { useIsMobile } from "@heroui/use-is-mobile"
import { formatCentsToBRL } from "@/src/app/_components/utils/currency"

interface TransactionsTableProps {
  data: RouterOutputs["transaction"]["getByMonth"][0][]
  isLoading?: boolean
  title?: string
}

export function TransactionsTable({
  data,
  isLoading = false,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "transactionDate", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const isMobile = useIsMobile()

  const columns = useMemo<ColumnDef<TransactionsTableProps["data"][0]>[]>(
    () => [
      {
        accessorKey: "transactionDate",
        header: "Data",
        cell: (info) => (
          <span className="text-sm font-medium">
            {(info.getValue() as Date).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Descrição",
      },
      {
        accessorKey: "category",
        header: "Categoria",
        cell: (info) => {
          const category = info.getValue() as
            | { name: string; color: string; icon: string }
            | undefined
          return category ? (
            <Chip
              color="primary"
              variant="flat"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
              }}
            >
              {category.name}
            </Chip>
          ) : (
            <span className="text-gray-500">-</span>
          )
        },
      },
      {
        accessorKey: "amountCents",
        header: "Valor",
        cell: (info) => {
          return (
            <span className="font-medium">
              {formatCentsToBRL(info.getValue() as number)}
            </span>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <Checkbox
            defaultSelected={info.getValue() === "CONFIRMED"}
          ></Checkbox>
        ),
      },
      {
        id: "actions",
        cell: () => (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ações">
              <DropdownItem key="edit">Editar</DropdownItem>
              <DropdownItem key="delete" className="text-danger">
                Excluir
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const filteredData = table.getRowModel().rows

  return (
    <div className="space-y-4">
      {isMobile ? (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : filteredData.length === 0 ? (
            <p className="py-4 text-center text-foreground">
              Nenhuma transação encontrada
            </p>
          ) : (
            <div className="mt-8 grid gap-4">
              {filteredData.map((row) => (
                <MobileTransactionCard
                  key={row.id}
                  transaction={row.original}
                />
              ))}
            </div>
          )}

          {table.getPageCount() > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                variant="flat"
                color="primary"
                page={table.getState().pagination.pageIndex + 1}
                total={table.getPageCount()}
                onChange={(page) => table.setPageIndex(page - 1)}
              />
            </div>
          )}
        </div>
      ) : (
        <Table
          aria-label="Tabela de transações"
          classNames={{
            wrapper: "bg-background",
            th: "bg-primary/10 text-primary font-bold text-md",
          }}
          bottomContent={
            table.getPageCount() > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  variant="flat"
                  showControls
                  color="primary"
                  page={table.getState().pagination.pageIndex + 1}
                  total={table.getPageCount()}
                  onChange={(page) => {
                    table.setPageIndex(page - 1)
                  }}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            {table.getHeaderGroups()[0].headers.map((header) => (
              <TableColumn key={header.id}>
                <div
                  className="flex cursor-pointer items-center"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {{
                    asc: <ChevronUp size={16} className="ml-1" />,
                    desc: <ChevronDown size={16} className="ml-1" />,
                  }[header.column.getIsSorted() as string] ?? null}
                </div>
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={<Spinner />}
            emptyContent={
              <span className="font-medium text-default-500">
                Nenhuma transação encontrada
              </span>
            }
          >
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
