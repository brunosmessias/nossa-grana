import { useCallback } from "react"
import { api, RouterOutputs } from "@/src/trpc/react"
import { CategoryType } from "@/src/server/api/routers/category"

type Category =
  RouterOutputs["category"]["getAllWithStats"]["categories"][number]
type CategoryConfig =
  RouterOutputs["category"]["getAllWithStats"]["categoryConfig"]
type ChartData = RouterOutputs["category"]["getAllWithStats"]["chartData"]

export function useCategoriesOptimistic() {
  const utils = api.useUtils()

  const upsertCategory = useCallback(
    async (category: CategoryType) => {
      const previousData = utils.category.getAllWithStats.getData()

      utils.category.getAllWithStats.setData(undefined, (old) => {
        if (!old) return old

        const isUpdate = !!category.id
        let updatedCategories = [...old.categories]
        let updatedCategoryConfig = { ...old.categoryConfig }

        if (isUpdate) {
          const existingCategoryIndex = old.categories.findIndex(
            (c) => c.id === category.id
          )

          if (existingCategoryIndex === -1) return old

          updatedCategories[existingCategoryIndex] = {
            ...old.categories[existingCategoryIndex],
            name: category.name,
            type: category.type,
            color: category.color,
            icon: category.icon,
          }

          const oldKey = Object.keys(updatedCategoryConfig).find(
            (key) => updatedCategoryConfig[key].id === category.id
          )

          if (oldKey) {
            delete updatedCategoryConfig[oldKey]
          }
        } else {
          const optimisticCategory: Category = {
            id: `temp-${Date.now()}`,
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
            totalAmountCents: 0,
            quantityTransactions: 0,
          }

          updatedCategories = [...old.categories, optimisticCategory]
        }

        if (category.type === "EXPENSE") {
          const newKey = category.name.toLowerCase().replace(/\s+/g, "_")
          const categoryId = isUpdate ? category.id! : `temp-${Date.now()}`

          updatedCategoryConfig[newKey] = {
            id: categoryId,
            label: category.name,
            color: category.color,
          }
        }

        return {
          ...old,
          categories: updatedCategories,
          categoryConfig: updatedCategoryConfig,
        }
      })

      return { previousData }
    },
    [utils]
  )

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      const previousData = utils.category.getAllWithStats.getData()

      utils.category.getAllWithStats.setData(undefined, (old) => {
        if (!old) return old

        // Encontrar e remover categoria
        const categoryToDelete = old.categories.find((c) => c.id === categoryId)
        if (!categoryToDelete) return old

        const updatedCategories = old.categories.filter(
          (c) => c.id !== categoryId
        )

        // Atualizar o categoryConfig
        const updatedCategoryConfig = { ...old.categoryConfig }

        const keyToDelete = Object.keys(updatedCategoryConfig).find(
          (key) => updatedCategoryConfig[key].id === categoryId
        )

        if (keyToDelete) {
          delete updatedCategoryConfig[keyToDelete]
        }

        return {
          ...old,
          categories: updatedCategories,
          categoryConfig: updatedCategoryConfig,
        }
      })

      return { previousData }
    },
    [utils]
  )

  const rollback = useCallback(
    (
      previousData:
        | {
            categories: Category[]
            chartData: ChartData
            categoryConfig: CategoryConfig
          }
        | undefined
    ) => {
      utils.category.getAllWithStats.setData(undefined, previousData)
    },
    [utils]
  )

  return {
    upsertCategory,
    deleteCategory,
    rollback,
  }
}
