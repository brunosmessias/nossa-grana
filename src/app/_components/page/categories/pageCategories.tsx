"use client"

import { useState } from "react"
import {
  AddCategoryCard,
  CategoryCard,
} from "@/src/app/_components/page/categories/cardCategory"
import { CategoriasChart } from "@/src/app/_components/page/categories/categoriesChart"
import { api } from "@/src/trpc/react"
import ModalUpsertCategory from "@/src/app/_components/page/categories/modalUpsertCategory"
import { useDisclosure } from "@heroui/modal"
import { CategoryType } from "@/src/server/api/routers/category"
import ModalDeleteCategory from "@/src/app/_components/page/categories/modelDeleteCategory"

export default function ClientPageCategories() {
  const query = api.category.getAllWithStats.useQuery()

  const disclosure = {
    upsertCategory: useDisclosure(),
    deleteCategory: useDisclosure(),
  }

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>()

  function editCategory(category: CategoryType) {
    setSelectedCategory(category)
    disclosure.upsertCategory.onOpen()
  }
  function deleteCategory(category: CategoryType) {
    setSelectedCategory(category)
    disclosure.deleteCategory.onOpen()
  }

  return (
    <>
      <section className="my-4 flex w-full flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-5xl">
          Gestão de Categorias
        </h1>

        <legend className="font-semibold text-default-600 lg:text-lg">
          Aqui você cria, edita e acompanha gastos e receitas por cor/tipo,
          obtendo insights automáticos para tomar decisões financeiras mais
          assertivas.
        </legend>
      </section>

      <div className="flex grow flex-col gap-4 pb-2">
        {/*Grafico*/}
        <div className="hidden h-64 w-full grow flex-col rounded-md border-1 border-default-200 p-4 lg:flex">
          <h2 className="font-mono text-xl text-default-600">Gastos por mês</h2>
          {query.isFetched && query.data && (
            <CategoriasChart data={query.data} />
          )}
        </div>

        {/*Cards*/}
        <div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AddCategoryCard
              onCreate={() => {
                disclosure.upsertCategory.onOpen()
              }}
            />

            {query.data &&
              query.data.categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={editCategory}
                  onDelete={deleteCategory}
                />
              ))}
          </div>
        </div>
      </div>

      {/*  Modals*/}
      <ModalUpsertCategory
        defaultCategory={selectedCategory}
        disclosure={disclosure.upsertCategory}
      ></ModalUpsertCategory>

      <ModalDeleteCategory
        disclosure={disclosure.deleteCategory}
        category={selectedCategory}
      ></ModalDeleteCategory>
    </>
  )
}
