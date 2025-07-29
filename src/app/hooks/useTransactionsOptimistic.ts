import { useCallback } from "react"
import { api, RouterOutputs } from "@/src/trpc/react"
import { DateState } from "@/src/app/_components/page/dashboard/pageTransactions"
import { TransactionType } from "@/src/server/api/routers/transaction"
import { parseCurrencyToCents } from "@/src/app/_components/utils/currency"

type Transaction = RouterOutputs["transaction"]["getByMonth"][number]

type OptimisticTransactionData = TransactionType & {
  type: "INCOME" | "EXPENSE"
  category: {
    id: string
    name: string
    color: string | null
  }
}
export function useTransactionsOptimistic(dateState: DateState) {
  const utils = api.useUtils()

  const upsertTransaction = useCallback(
    async (transaction: OptimisticTransactionData) => {
      const queryKey = dateState

      const previousTransactions =
        utils.transaction.getByMonth.getData(queryKey)

      utils.transaction.getByMonth.setData(queryKey, (old) => {
        const newTransaction: Transaction = {
          id: transaction.id || `temp-${Date.now()}`,
          description: transaction.description,
          amountCents: parseCurrencyToCents(transaction.amountCents),
          type: transaction.type,
          isPaid: transaction.isPaid,
          transactionDate: transaction.transactionDate,
          category: transaction.category,
          createdBy: { name: "Você" }, // ou pegar do session
        }

        if (!old) return [newTransaction]

        // Se for edição, substitui a transação existente
        if (transaction.id) {
          return old.map((t) => (t.id === transaction.id ? newTransaction : t))
        }

        // Se for nova transação, adiciona e ordena por data
        const updated = [...old, newTransaction]
        return updated.sort(
          (a, b) =>
            new Date(a.transactionDate).getTime() -
            new Date(b.transactionDate).getTime()
        )
      })

      return { previousTransactions }
    },
    [utils, dateState]
  )

  const deleteTransaction = useCallback(
    async (transactionId: string) => {
      const queryKey = dateState

      const previousTransactions =
        utils.transaction.getByMonth.getData(queryKey)

      // Remove a transação otimisticamente
      utils.transaction.getByMonth.setData(
        queryKey,
        (old) => old?.filter((t) => t.id !== transactionId) ?? []
      )

      // Atualiza o balance
      const transactionToDelete = previousTransactions?.find(
        (t) => t.id === transactionId
      )

      if (transactionToDelete) {
        utils.balance.getAccumulatedBalance.setData(queryKey, (old) => {
          const amount = transactionToDelete.amountCents
          const multiplier = transactionToDelete.type === "INCOME" ? 1 : -1
          const delta = amount * multiplier

          const baseBalance = old || { currentPaid: 0, projected: 0 }

          return {
            currentPaid: transactionToDelete.isPaid
              ? baseBalance.currentPaid - delta
              : baseBalance.currentPaid,
            projected: baseBalance.projected - delta,
          }
        })
      }

      return { previousTransactions }
    },
    [utils, dateState]
  )

  const rollback = useCallback(
    (previousTransactions: Transaction[] | undefined) => {
      utils.transaction.getByMonth.setData(dateState, previousTransactions)
    },
    [utils, dateState]
  )

  return {
    upsertTransaction,
    deleteTransaction,
    rollback,
  }
}
