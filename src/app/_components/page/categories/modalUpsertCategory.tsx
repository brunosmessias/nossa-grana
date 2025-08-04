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
import React, { useEffect, useState } from "react"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CategoryType } from "@/src/server/api/routers/category"
import { iconOptions } from "@/src/app/_components/utils/categoryIcons"
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete"
import { api } from "@/src/trpc/react"
import { addToast } from "@heroui/toast"
import { useCategoriesOptimistic } from "@/src/app/hooks/useCategoriesOptimistic"

type ModalTransactionsProps = {
  defaultCategory?: CategoryType
  disclosure: ReturnType<typeof useDisclosure>
}

export default function ModalUpsertCategory({
  defaultCategory,
  disclosure,
}: ModalTransactionsProps) {
  const [category, setCategory] = useState<CategoryType>(emptyForm())
  const utils = api.useUtils()
  const { upsertCategory } = useCategoriesOptimistic()

  const mutationCategory = api.category.upsert.useMutation({
    onMutate: async (variables) => {
      await utils.category.getAllWithStats.cancel()
      const { previousData } = await upsertCategory(variables)
      disclosure.onClose()

      return { previousData }
    },
    onSuccess: () => {
      addToast({
        title: "Categoria salva com sucesso!",
        color: "success",
      })

      setCategory(emptyForm())
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        utils.category.getAllWithStats.setData(undefined, context.previousData)
      }

      disclosure.onOpen()

      addToast({
        title: "Erro ao salvar categoria",
        color: "danger",
        description: error.message,
      })
    },
    onSettled: () => {
      void utils.category.invalidate()
    },
  })

  const colorOptions = [
    { value: "red", hex: "#e61a1a" },
    { value: "blue", hex: "#1866e4" },
    { value: "green", hex: "#1be666" },
    { value: "yellow", hex: "#eab308" },
    { value: "purple", hex: "#7204dd" },
    { value: "pink", hex: "#ec4899" },
    { value: "indigo", hex: "#6c6dc3" },
    { value: "orange", hex: "#ef6606" },
    { value: "teal", hex: "#13ead2" },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!category.icon) {
      addToast({
        color: "danger",
        title: "Selecione um ícone",
      })

      return
    }

    if (!category.color) {
      addToast({
        color: "danger",
        title: "Selecione uma cor",
      })
      return
    }
    mutationCategory.mutate(category)
  }

  function emptyForm() {
    return {
      id: undefined,
      color: "",
      name: "",
      type: "INCOME" as "INCOME" | "EXPENSE",
      icon: "",
    }
  }

  useEffect(() => {
    if (defaultCategory) {
      setCategory({
        ...defaultCategory,
      })
    } else {
      setCategory(emptyForm())
    }
  }, [defaultCategory])

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
                  {defaultCategory?.id ? "Editar" : "Adicionar"} Categoria
                </h2>
              </ModalHeader>
              <ModalBody>
                <Input
                  isRequired
                  autoFocus
                  labelPlacement="outside-top"
                  label={"Descrição"}
                  className="lg:col-span-2"
                  value={category.name}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      name: e.target.value,
                    })
                  }
                />

                <Autocomplete
                  label="Tipo"
                  labelPlacement="outside-top"
                  isRequired
                  selectedKey={category.type}
                  onSelectionChange={(e) => {
                    if (!e) return
                    setCategory({
                      ...category,
                      type: e.toString() as "INCOME" | "EXPENSE",
                    })
                  }}
                >
                  <AutocompleteItem key="INCOME">Renda</AutocompleteItem>
                  <AutocompleteItem key="EXPENSE">Despesa</AutocompleteItem>
                </Autocomplete>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    Ícone <span className="text-danger">*</span>
                  </label>
                  <div className="grid grid-cols-7 gap-2 rounded-2xl bg-default-100 p-2">
                    {iconOptions.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <Button
                          isIconOnly
                          color={
                            category.icon === option.value
                              ? "primary"
                              : "default"
                          }
                          variant={
                            category.icon === option.value ? "solid" : "faded"
                          }
                          key={option.value}
                          onPress={() =>
                            setCategory({
                              ...category,
                              icon: option.value,
                            })
                          }
                        >
                          <IconComponent size={20} />
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    Cor <span className="text-danger">*</span>
                  </label>
                  <div className="flex justify-between rounded-2xl bg-default-100 p-2">
                    {colorOptions.map((color) => (
                      <button
                        type="button"
                        className={`h-8 w-8 rounded-full border-3 border-transparent transition-all duration-300 hover:border-white/75 ${
                          category.color === color.hex
                            ? `!scale-125 !border-white`
                            : ""
                        } `}
                        style={{
                          backgroundColor: color.hex,
                        }}
                        onClick={() =>
                          setCategory({
                            ...category,
                            color: color.hex,
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={mutationCategory.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  type="submit"
                  isLoading={mutationCategory.isPending}
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
