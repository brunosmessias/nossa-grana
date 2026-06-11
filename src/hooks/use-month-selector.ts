"use client"

import { useCallback, useMemo, useState } from "react"

import { addMonths, compareMonthKeys } from "@/lib/month-key"

export type UseMonthSelectorOptions = {
  initialMonth?: string
  minMonth: string | null
  currentMonthKey: string
}

export type UseMonthSelectorResult = {
  selectedMonth: string
  setSelectedMonth: (m: string) => void
  goToPrev: () => void
  goToNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
}

function clamp(monthKey: string, minMonth: string | null, currentMonthKey: string): string {
  if (minMonth !== null && compareMonthKeys(monthKey, minMonth) < 0) {
    return minMonth
  }
  if (compareMonthKeys(monthKey, currentMonthKey) > 0) {
    return currentMonthKey
  }
  return monthKey
}

export function useMonthSelector(
  opts: UseMonthSelectorOptions,
): UseMonthSelectorResult {
  const { initialMonth, minMonth, currentMonthKey } = opts

  const [selectedMonth, setSelectedMonthState] = useState<string>(() =>
    clamp(initialMonth ?? currentMonthKey, minMonth, currentMonthKey),
  )

  const canGoNext = useMemo(
    () => compareMonthKeys(selectedMonth, currentMonthKey) < 0,
    [selectedMonth, currentMonthKey],
  )

  const canGoPrev = useMemo(
    () =>
      minMonth === null
        ? true
        : compareMonthKeys(selectedMonth, minMonth) > 0,
    [selectedMonth, minMonth],
  )

  const goToNext = useCallback(() => {
    if (!canGoNext) return
    setSelectedMonthState((prev) => clamp(addMonths(prev, 1), minMonth, currentMonthKey))
  }, [canGoNext, minMonth, currentMonthKey])

  const goToPrev = useCallback(() => {
    if (!canGoPrev) return
    setSelectedMonthState((prev) => clamp(addMonths(prev, -1), minMonth, currentMonthKey))
  }, [canGoPrev, minMonth, currentMonthKey])

  const setSelectedMonth = useCallback(
    (m: string) => {
      setSelectedMonthState(clamp(m, minMonth, currentMonthKey))
    },
    [minMonth, currentMonthKey],
  )

  return {
    selectedMonth,
    setSelectedMonth,
    goToPrev,
    goToNext,
    canGoPrev,
    canGoNext,
  }
}
