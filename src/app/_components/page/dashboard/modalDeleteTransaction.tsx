// src/components/transactions/delete-transaction-modal.tsx
"use client"

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal"
import { Button } from "@heroui/button"
import { api } from "@/src/trpc/react"
import { TransactionType } from "@/src/server/api/routers/transaction"
import { DateState } from "@/src/app/_components/page/dashboard/pageTransactions"
import { useTransactionsOptimistic } from "@/src/app/hooks/useTransactionsOptimistic"
import { addToast } from "@heroui/toast"
import { formatCurrency } from "@/src/app/_components/utils/currency"

type DeleteTransactionModalProps = {
  disclosure: ReturnType<typeof useDisclosure>
  transaction?: TransactionType
  dateState: DateState
}

export default function ModalDeleteTransaction({
  disclosure,
  transaction,
  dateState,
}: DeleteTransactionModalProps) {
  const utils = api.useUtils()
  const { deleteTransaction } = useTransactionsOptimistic(dateState)

  const deleteMutation = api.transaction.delete.useMutation({
    onMutate: async () => {
      await utils.transaction.getByMonth.cancel(dateState)
      await utils.balance.getAccumulatedBalance.cancel({ ...dateState })

      const { previousTransactions } = await deleteTransaction(transaction!.id!)
      disclosure.onClose()

      return { previousTransactions }
    },
    onError: (error, variables, context) => {
      if (context) {
        utils.transaction.getByMonth.setData(
          dateState,
          context.previousTransactions
        )
      }
      disclosure.onOpen()
      addToast({
        title: "Erro ao deletar transação",
        color: "danger",
      })
    },
    onSuccess: () => {
      addToast({
        title: "Transação deletada com sucesso",
        color: "success",
      })
    },
    onSettled: () => {
      void utils.transaction.getByMonth.invalidate(dateState)
      void utils.balance.getAccumulatedBalance.invalidate(dateState)
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate({ id: transaction!.id! })
  }

  return (
    <Modal
      backdrop="blur"
      isOpen={disclosure.isOpen}
      onOpenChange={disclosure.onOpenChange}
      classNames={{
        base: "border-2 border-danger-300 bg-background",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="font-heading text-xl font-bold">
                Confirmar Exclusão
              </h2>
            </ModalHeader>
            <ModalBody>
              <p className="text-foreground">
                Tem certeza que deseja deletar essa transação ?
              </p>
              <p className="flex flex-col gap-2 rounded-2xl bg-default-50 px-4 py-2 text-foreground">
                <span>Nome: {transaction!.description}</span>
                <span>Valor: {formatCurrency(transaction!.amountCents)}</span>
                <span>
                  Data: {transaction!.transactionDate.toLocaleDateString()}
                </span>
              </p>
              <p className="font-semibold text-default-400">
                Esta ação não pode ser desfeita.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                isDisabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                color="danger"
                variant="flat"
                onPress={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                Deletar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
