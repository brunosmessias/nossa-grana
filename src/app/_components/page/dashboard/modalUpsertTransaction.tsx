"use client"

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal"
import { Form } from "@heroui/form"
import React, { useEffect, useMemo, useState } from "react"
import { Input } from "@heroui/input"
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from "@heroui/autocomplete"
import { api, RouterOutputs } from "@/src/trpc/react"
import { DatePicker } from "@heroui/date-picker"
import { fromDate, getLocalTimeZone } from "@internationalized/date"
import { Checkbox } from "@heroui/checkbox"
import { Button } from "@heroui/button"
import {
  applyAmountMask,
  formatCurrency,
} from "@/src/app/_components/utils/currency"
import { TransactionType } from "@/src/server/api/routers/transaction"
import { useTransactionsOptimistic } from "@/src/app/hooks/useTransactionsOptimistic"
import { DateState } from "@/src/app/_components/page/dashboard/pageTransactions"
import { addToast } from "@heroui/toast"

type ModalTransactionsProps = {
  categories: RouterOutputs["category"]["getAll"]
  disclosure: ReturnType<typeof useDisclosure>
  defaultTransaction?: TransactionType
  dateState: DateState
}

type CategoryGroups = {
  incomes: RouterOutputs["category"]["getAll"]
  expenses: RouterOutputs["category"]["getAll"]
}

export default function ModalUpsertTransaction({
  categories,
  disclosure,
  defaultTransaction,
  dateState,
}: ModalTransactionsProps) {
  const [transaction, setTransaction] = useState<TransactionType>(emptyForm())
  const utils = api.useUtils()
  const { upsertTransaction } = useTransactionsOptimistic(dateState)

  const mutationTransaction = api.transaction.upsert.useMutation({
    onMutate: async (variables) => {
      await utils.transaction.getByMonth.cancel({ ...dateState })
      await utils.balance.getAccumulatedBalance.cancel({ ...dateState })

      const category = categories.find((c) => c.id === variables.categoryId)
      if (!category) throw new Error("Categoria não encontrada")

      const { previousTransactions } = await upsertTransaction({
        ...variables,
        type: category.type,
        category: {
          id: category.id,
          name: category.name,
          color: category.color,
        },
      })

      disclosure.onClose()
      return { previousTransactions }
    },
    onSuccess: () => {
      addToast({
        title: "Transação salva!",
        color: "success",
      })

      setTransaction(emptyForm())
    },
    onError: (error, variables, context) => {
      if (context) {
        utils.transaction.getByMonth.setData(
          { ...dateState },
          context.previousTransactions
        )
      }

      disclosure.onOpen()
      addToast({
        title: "Erro ao salvar transação",
        color: "success",
      })
    },
    onSettled: () => {
      void utils.transaction.getByMonth.invalidate({ ...dateState })
      void utils.balance.getAccumulatedBalance.invalidate({ ...dateState })
    },
  })

  useEffect(() => {
    if (defaultTransaction) {
      setTransaction({
        ...defaultTransaction,
        amountCents: formatCurrency(defaultTransaction.amountCents),
      })
    } else {
      setTransaction(emptyForm())
    }
  }, [defaultTransaction])

  const categoriesGrouped = useMemo<CategoryGroups>(() => {
    const initial: CategoryGroups = {
      expenses: [],
      incomes: [],
    }

    return (
      categories?.reduce((acc, category) => {
        if (category.type === "EXPENSE") {
          acc.expenses.push(category)
        } else if (category.type === "INCOME") {
          acc.incomes.push(category)
        }
        return acc
      }, initial) || initial
    )
  }, [categories])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const category = categories.find((c) => c.id === transaction.categoryId)
    if (!category) {
      console.error("Categoria não encontrada")
      return
    }

    mutationTransaction.mutate(transaction)
  }

  function emptyForm() {
    return {
      id: undefined,
      description: "",
      categoryId: "",
      amountCents: "",
      transactionDate: new Date(),
      isPaid: false,
    }
  }

  return (
    <Modal
      backdrop="blur"
      isOpen={disclosure.isOpen}
      onOpenChange={disclosure.onOpenChange}
      classNames={{
        base: "border-2 border-default-300 bg-background",
        body: "w-full",
        footer: "self-end",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <Form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col">
                <h2 className="font-heading text-xl font-bold">
                  {defaultTransaction?.id ? "Editar" : "Adicionar"} Transação
                </h2>
              </ModalHeader>
              <ModalBody>
                <Input
                  isRequired
                  autoFocus
                  label={"Descrição"}
                  className="lg:col-span-2"
                  value={transaction.description}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      description: e.target.value,
                    })
                  }
                />

                <Autocomplete
                  label="Categoria"
                  placeholder="Selecione uma categoria"
                  className="lg:col-span-2"
                  defaultItems={categories}
                  isRequired
                  isClearable={false}
                  selectedKey={transaction.categoryId}
                  onSelectionChange={(e) => {
                    if (!e) return
                    setTransaction({
                      ...transaction,
                      categoryId: e.toString(),
                    })
                  }}
                >
                  {categoriesGrouped.expenses.length > 0 ? (
                    <AutocompleteSection title="Despesa">
                      {categoriesGrouped.expenses.map((category) => (
                        <AutocompleteItem
                          key={category.id}
                          textValue={category.name}
                        >
                          <div className="flex items-center gap-2">
                            {category.color && (
                              <div
                                className="h-3 w-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            {category.name}
                          </div>
                        </AutocompleteItem>
                      ))}
                    </AutocompleteSection>
                  ) : null}

                  {categoriesGrouped.incomes.length > 0 ? (
                    <AutocompleteSection title="Renda">
                      {categoriesGrouped.incomes.map((category) => (
                        <AutocompleteItem
                          key={category.id}
                          textValue={category.name}
                        >
                          <div className="flex items-center gap-2">
                            {category.color && (
                              <div
                                className="h-3 w-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            {category.name}
                          </div>
                        </AutocompleteItem>
                      ))}
                    </AutocompleteSection>
                  ) : null}
                </Autocomplete>

                <div className="grid w-full gap-3 lg:grid-cols-2">
                  <Input
                    label="Valor"
                    isRequired
                    placeholder="0,00"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">R$</span>
                      </div>
                    }
                    value={transaction.amountCents}
                    onChange={(e) =>
                      setTransaction({
                        ...transaction,
                        amountCents: applyAmountMask(e.target.value),
                      })
                    }
                  />

                  <DatePicker
                    isRequired
                    showMonthAndYearPickers
                    label="Data de Pagamento"
                    className="basis-1/4"
                    granularity={"day"}
                    value={
                      transaction.transactionDate
                        ? fromDate(
                            transaction.transactionDate,
                            getLocalTimeZone()
                          )
                        : null
                    }
                    onChange={(value) => {
                      if (!value) return
                      setTransaction({
                        ...transaction,
                        transactionDate: value.toDate(),
                      })
                    }}
                  />
                </div>

                <Checkbox
                  isSelected={transaction.isPaid}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      isPaid: e.target.checked,
                    })
                  }
                >
                  Pago
                </Checkbox>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={mutationTransaction.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  type="submit"
                  isLoading={mutationTransaction.isPending}
                >
                  Salvar
                </Button>
              </ModalFooter>
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
