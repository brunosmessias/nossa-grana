"use client"

import { toast } from "@/components/ui/sonner"
import { api } from "@/trpc/react"
import { useInvalidateQueries } from "@/hooks/use-invalidate-queries"

export type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CASH"
  | "INVESTMENT"
  | "CREDIT_CARD"
  | "LOAN"
  | "GOAL"

export type CreateAccountInput = {
  name: string
  type: AccountType
  initialBalanceCents: number
  icon: string
  color: string
}

export type CreateCategoryInput = {
  name: string
  kind: "INCOME" | "EXPENSE"
  icon: string
  color: string
}

export type TransactionInput = {
  accountId: string
  categoryId: string
  type: "INCOME" | "EXPENSE"
  description: string
  amountCents: number
  transactionAt: string
  paid: boolean
}

export function useDashboardMutations(familyId: string) {
  const invalidate = useInvalidateQueries()

  const createAccountMutation = api.accounts.upsert.useMutation({
    onSuccess: () => { void invalidate(["accounts"]) },
    onError: () => { toast.error("Falha ao criar conta") },
  })

  const createCategoryMutation = api.categories.create.useMutation({
    onSuccess: () => { void invalidate(["categories"]) },
    onError: () => { toast.error("Falha ao criar categoria") },
  })

  const createTransactionMutation = api.transactions.create.useMutation({
    onSuccess: () => { void invalidate(["transactions", "accounts"]) },
    onError: () => { toast.error("Falha ao criar transação") },
  })

  const updateTransactionMutation = api.transactions.update.useMutation({
    onSuccess: () => { void invalidate(["transactions", "accounts"]) },
    onError: () => { toast.error("Falha ao atualizar transação") },
  })

  const togglePaidMutation = api.transactions.update.useMutation()

  const createAccount = async (input: CreateAccountInput) => {
    await createAccountMutation.mutateAsync({
      familyId,
      ...input,
      archived: false,
    })
  }

  const createCategory = async (input: CreateCategoryInput) => {
    await createCategoryMutation.mutateAsync({ familyId, ...input })
  }

  const createTransaction = async (txData: TransactionInput) => {
    await createTransactionMutation.mutateAsync({ familyId, ...txData })
  }

  const updateTransaction = async (
    transactionId: string,
    txData: TransactionInput,
  ) => {
    await updateTransactionMutation.mutateAsync({
      familyId,
      transactionId,
      ...txData,
    })
  }

  const togglePaid = async (transactionId: string, next: boolean) => {
    try {
      await togglePaidMutation.mutateAsync({
        familyId,
        transactionId,
        paid: next,
      })
      await invalidate(["transactions", "accounts"])
    } catch {
      toast.error("Não foi possível atualizar o status. Tente novamente.")
      throw new Error()
    }
  }

  return {
    createAccount,
    createCategory,
    createTransaction,
    updateTransaction,
    togglePaid,
  }
}
