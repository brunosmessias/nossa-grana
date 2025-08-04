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
import { CategoryType } from "@/src/server/api/routers/category"
import { addToast } from "@heroui/toast"
import { useCategoriesOptimistic } from "@/src/app/hooks/useCategoriesOptimistic"

type DeleteCategoryModalProps = {
  disclosure: ReturnType<typeof useDisclosure>
  category?: CategoryType
}

export default function ModalDeleteCategory({
  disclosure,
  category,
}: DeleteCategoryModalProps) {
  const utils = api.useUtils()
  const { deleteCategory } = useCategoriesOptimistic()

  const deleteMutation = api.category.delete.useMutation({
    onMutate: async () => {
      await utils.category.getAllWithStats.cancel()

      const { previousData } = await deleteCategory(category!.id!)
      disclosure.onClose()

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context) {
        utils.category.getAllWithStats.setData(undefined, context.previousData)
      }
      disclosure.onOpen()
      addToast({
        title: "Erro ao deletar categoria",
        color: "danger",
      })
    },
    onSuccess: () => {
      addToast({
        title: "Categoria deletada com sucesso",
        color: "success",
      })
    },
    onSettled: () => {
      void utils.category.invalidate()
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate({ id: category!.id! })
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
                Tem certeza que deseja deletar essa categoria ?
              </p>
              <span>
                As transações associadas a ela{" "}
                <strong className="text-danger">não serão deletadas</strong>!
              </span>
              <p className="flex flex-col gap-2 rounded-2xl bg-default-50 px-4 py-2 text-foreground">
                <span>Nome: {category!.name}</span>
                <span>
                  Tipo da categoria:{" "}
                  {category!.type === "EXPENSE" ? "Despesa" : "Renda"}
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
