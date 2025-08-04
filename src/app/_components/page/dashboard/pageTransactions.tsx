"use client"

import { TransactionsTable } from "@/src/app/_components/page/dashboard/tableTransactions"
import { api, RouterOutputs } from "@/src/trpc/react"
import { useMemo, useState } from "react"
import { Chip } from "@heroui/chip"
import { formatCentsToBRL } from "@/src/app/_components/utils/currency"
import { SectionBalance } from "@/src/app/_components/page/dashboard/sectionBalance"
import { useDisclosure } from "@heroui/modal"
import ModalUpsertTransaction from "@/src/app/_components/page/dashboard/modalUpsertTransaction"
import { TransactionType } from "@/src/server/api/routers/transaction"
import { SectionMonthSelector } from "@/src/app/_components/page/dashboard/sectionMonthSelector"
import ModalDeleteTransaction from "@/src/app/_components/page/dashboard/modalDeleteTransaction"
import ExpandingButton from "../../external/expandableButton"
import { PlusIcon } from "lucide-react"

export type DateState = {
  year: number
  month: number
}

type TransactionGroups = {
  expenses: RouterOutputs["transaction"]["getByMonth"]
  incomes: RouterOutputs["transaction"]["getByMonth"]
  expenseTotal: number
  incomeTotal: number
}

export default function ClientPageDashboard() {
  const today = new Date()
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  })

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionType>()
  const disclosure = {
    upsertTransaction: useDisclosure(),
    deleteTransaction: useDisclosure(),
  }

  const query = api.transaction.getByMonth.useQuery({
    month: current.month,
    year: current.year,
  })

  const queryCategory = api.category.getAll.useQuery(undefined, {
    staleTime: Infinity,
  })

  const transactionGroups = useMemo<TransactionGroups>(() => {
    const initial: TransactionGroups = {
      expenses: [],
      incomes: [],
      expenseTotal: 0,
      incomeTotal: 0,
    }

    return (
      query.data?.reduce((acc, transaction) => {
        if (transaction.type === "EXPENSE") {
          acc.expenses.push(transaction)
          acc.expenseTotal += transaction.amountCents
        } else if (transaction.type === "INCOME") {
          acc.incomes.push(transaction)
          acc.incomeTotal += transaction.amountCents
        }
        return acc
      }, initial) || initial
    )
  }, [query.data])

  function addTransaction() {
    setSelectedTransaction(undefined)
    disclosure.upsertTransaction.onOpen()
  }

  function editTransaction(transaction: TransactionType) {
    setSelectedTransaction(transaction)
    disclosure.upsertTransaction.onOpen()
  }

  function deleteTransaction(transaction: TransactionType) {
    setSelectedTransaction(transaction)
    disclosure.deleteTransaction.onOpen()
  }

  return (
    <>
      <section className="my-4 flex w-full flex-col justify-between lg:flex-row">
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-5xl">
          Transações do mês
        </h1>
        <SectionMonthSelector dateState={current} setDateState={setCurrent} />
      </section>

      <div className="flex grow flex-col-reverse justify-end gap-4 lg:flex-row">
        <div className="flex w-full flex-col gap-4">
          <div className="hidden gap-2 lg:flex">
            <ExpandingButton
              color="primary"
              text="Adicionar transação"
              variant="flat"
              className="w-full"
              width={11}
              onPress={addTransaction}
            >
              <PlusIcon size={20} />
            </ExpandingButton>
          </div>

          <section className="w-full grow rounded-md border-2 border-default-100 p-2">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-3xl text-default-500">Despesas</h3>
              <Chip variant="faded" color="primary">
                {formatCentsToBRL(transactionGroups.expenseTotal)}
              </Chip>
            </div>

            <TransactionsTable
              data={transactionGroups.expenses || []}
              isLoading={query.isLoading}
              onEditTransaction={editTransaction}
              onDeleteTransaction={deleteTransaction}
            ></TransactionsTable>
          </section>
        </div>

        <div className="flex w-full flex-col gap-4">
          <SectionBalance date={current} />

          <div className="flex gap-2 lg:hidden">
            <ExpandingButton
              color="primary"
              text="Adicionar transação"
              variant="flat"
              width={12}
              onPress={addTransaction}
            >
              <PlusIcon size={20} />
            </ExpandingButton>
          </div>
          <section className="w-full grow rounded-md border-2 border-default-100 p-2">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-3xl text-default-500">Renda</h3>
              <Chip variant="faded" color="primary">
                {formatCentsToBRL(transactionGroups.incomeTotal)}
              </Chip>
            </div>

            <TransactionsTable
              data={transactionGroups.incomes || []}
              isLoading={query.isLoading}
              onEditTransaction={editTransaction}
              onDeleteTransaction={deleteTransaction}
            ></TransactionsTable>
          </section>
        </div>
      </div>

      <ModalUpsertTransaction
        categories={queryCategory.data ?? []}
        disclosure={disclosure.upsertTransaction}
        defaultTransaction={selectedTransaction}
        dateState={current}
      ></ModalUpsertTransaction>

      <ModalDeleteTransaction
        disclosure={disclosure.deleteTransaction}
        transaction={selectedTransaction}
        dateState={current}
      ></ModalDeleteTransaction>
    </>
  )
}
