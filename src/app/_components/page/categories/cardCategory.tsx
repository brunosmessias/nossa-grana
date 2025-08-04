"use client"

import { useState } from "react"
import { CircleQuestionMark, Edit, Plus, Trash } from "lucide-react"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown"
import { Avatar } from "@heroui/avatar"
import { Chip } from "@heroui/chip"
import { formatCurrency } from "@/src/app/_components/utils/currency"
import { cn } from "@heroui/theme"
import { RouterOutputs } from "@/src/trpc/react"
import { iconOptions } from "@/src/app/_components/utils/categoryIcons"
import { CategoryType } from "@/src/server/api/routers/category"

interface categoryCardProps {
  category: RouterOutputs["category"]["getAllWithStats"]["categories"][0]
  onEdit: (category: CategoryType) => void
  onDelete: (category: CategoryType) => void
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: categoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent =
    iconOptions.find((t) => t.value === category.icon)?.icon ||
    CircleQuestionMark

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 bg-background p-6 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: `${category.color}60`,
      }}
    >
      {/* SVG Background que cresce no hover */}
      <div
        className={cn(
          "absolute inset-0 origin-bottom-right transition-all duration-700 ease-in-out",
          "opacity-50",
          "group-hover:scale-[2.5] group-hover:opacity-100"
        )}
        style={{
          background: `radial-gradient(circle at 90% 90%, ${category.color} 0%,  transparent 70%)`,
        }}
      />

      {/* Conteúdo do Card */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              size="md"
              icon={<IconComponent className="h-5 w-5" />}
              style={{
                backgroundColor: isHovered
                  ? "rgba(255,255,255,0.2)"
                  : category.color!,
              }}
              className="border-2 border-white/20 shadow-lg transition-all duration-300"
            />
            <div>
              <h3
                className={`text-lg font-semibold text-foreground transition-colors duration-300`}
              >
                {category.name}
              </h3>
              <Chip
                size="sm"
                className="border-1 border-transparent"
                color={category.type === "EXPENSE" ? "danger" : "success"}
                variant={isHovered ? "faded" : "light"}
              >
                {category.type}
              </Chip>
            </div>
          </div>
        </div>

        {/* Valor Principal */}
        <div className="mb-4">
          <p className="text-4xl font-bold">
            R$ {formatCurrency(category.totalAmountCents.toString())}
          </p>
          <p className="text-sm">total este mês</p>
        </div>

        {/* Footer com transações */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground/80 group-hover:text-white">
            {category.quantityTransactions} transações
          </span>

          <Dropdown>
            <DropdownTrigger>
              <div className="flex items-center space-x-2 text-default-700 transition-all duration-300 group-hover:text-white">
                <span className="text-sm">Mais detalhes</span>
                <svg
                  className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ações da category">
              <DropdownItem
                key="edit"
                startContent={<Edit className="h-4 w-4" />}
                onPress={() => onEdit(category)}
              >
                Editar
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<Trash className="h-4 w-4" />}
                onPress={() => onDelete(category)}
              >
                Excluir
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}

export function AddCategoryCard({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-default bg-default-50 px-6 py-2 transition-all hover:border-primary hover:bg-primary/20"
      onClick={onCreate}
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-center py-8 transition-all duration-300 group-hover:scale-110">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:border-primary group-hover:bg-primary">
          <Plus
            className={`h-8 w-8 rounded-full transition-all duration-300`}
          />
        </div>

        <h3 className="font-mono text-xl font-bold text-white">
          Criar categoria
        </h3>

        <p className="mt-2 text-center text-sm text-white/60">
          Personalize sua gestão financeira
        </p>
      </div>
    </div>
  )
}
