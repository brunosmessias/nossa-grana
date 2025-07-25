"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@heroui/button"
import { Dispatch, SetStateAction } from "react"
import { DateState } from "@/src/app/_components/page/dashboard/pageTransactions"

export interface MonthSelectorProps {
  dateState: DateState
  setDateState: Dispatch<SetStateAction<DateState>>
}

export function MonthSelector({ dateState, setDateState }: MonthSelectorProps) {
  const changeMonth = (delta: -1 | 1) => {
    setDateState((prev) => {
      let newMonth = prev.month + delta
      let newYear = prev.year

      if (newMonth === 0) {
        newMonth = 12
        newYear -= 1
      } else if (newMonth === 13) {
        newMonth = 1
        newYear += 1
      }

      return { year: newYear, month: newMonth }
    })
  }

  const isFuture = (year: number, month: number) => {
    const now = new Date()
    return (
      year > now.getFullYear() ||
      (year === now.getFullYear() && month > now.getMonth() + 1)
    )
  }

  const monthName = new Date(
    dateState.year,
    dateState.month - 1
  ).toLocaleDateString("pt-BR", { month: "long" })

  return (
    <div className="mt-2 flex w-full flex-col items-center lg:mr-10 lg:mt-0 lg:w-fit">
      <label className="translate-y-1 font-bold text-primary">
        Selecione um mês
      </label>
      <div className="flex items-center gap-2">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label="Mês anterior"
          onPress={() => changeMonth(-1)}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>

        <span className="w-28 text-center text-sm text-foreground">
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)} de{" "}
          {dateState.year}
        </span>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label="Próximo mês"
          onPress={() => changeMonth(1)}
          isDisabled={isFuture(dateState.year, dateState.month + 1)}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
