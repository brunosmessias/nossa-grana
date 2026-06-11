import { act, renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { useMonthSelector } from "./use-month-selector"

describe("useMonthSelector", () => {
  test("initial state: selectedMonth is currentMonthKey, canGoNext false, canGoPrev true", () => {
    const { result } = renderHook(() =>
      useMonthSelector({
        minMonth: "2024-03",
        currentMonthKey: "2024-06",
      }),
    )

    expect(result.current.selectedMonth).toBe("2024-06")
    expect(result.current.canGoNext).toBe(false)
    expect(result.current.canGoPrev).toBe(true)
  })

  test("goToPrev three times walks to minMonth, canGoPrev becomes false", () => {
    const { result } = renderHook(() =>
      useMonthSelector({
        minMonth: "2024-03",
        currentMonthKey: "2024-06",
      }),
    )

    act(() => result.current.goToPrev())
    expect(result.current.selectedMonth).toBe("2024-05")
    act(() => result.current.goToPrev())
    expect(result.current.selectedMonth).toBe("2024-04")
    act(() => result.current.goToPrev())
    expect(result.current.selectedMonth).toBe("2024-03")
    expect(result.current.canGoPrev).toBe(false)
  })

  test("goToNext at current month is a no-op", () => {
    const { result } = renderHook(() =>
      useMonthSelector({
        minMonth: "2024-01",
        currentMonthKey: "2024-06",
      }),
    )

    expect(result.current.canGoNext).toBe(false)
    act(() => result.current.goToNext())
    expect(result.current.selectedMonth).toBe("2024-06")
  })

  test("minMonth null means canGoPrev is always true", () => {
    const { result } = renderHook(() =>
      useMonthSelector({
        minMonth: null,
        currentMonthKey: "2024-06",
      }),
    )

    expect(result.current.canGoPrev).toBe(true)
    act(() => result.current.goToPrev())
    expect(result.current.selectedMonth).toBe("2024-05")
    expect(result.current.canGoPrev).toBe(true)
  })

  test("setSelectedMonth with value above current clamps to current", () => {
    const { result } = renderHook(() =>
      useMonthSelector({
        minMonth: "2024-01",
        currentMonthKey: "2024-06",
      }),
    )

    act(() => result.current.setSelectedMonth("2025-01"))
    expect(result.current.selectedMonth).toBe("2024-06")
  })

  test("setSelectedMonth with value below minMonth clamps to minMonth", () => {
    const { result } = renderHook(() =>
      useMonthSelector({
        minMonth: "2024-03",
        currentMonthKey: "2024-06",
      }),
    )

    act(() => result.current.setSelectedMonth("2023-12"))
    expect(result.current.selectedMonth).toBe("2024-03")
  })

  test("setSelectedMonth with in-range value accepts it", () => {
    const { result } = renderHook(() =>
      useMonthSelector({
        minMonth: "2024-01",
        currentMonthKey: "2024-12",
      }),
    )

    act(() => result.current.setSelectedMonth("2024-05"))
    expect(result.current.selectedMonth).toBe("2024-05")
  })

  test("initialMonth overrides default of currentMonthKey", () => {
    const { result } = renderHook(() =>
      useMonthSelector({
        initialMonth: "2024-04",
        minMonth: "2024-01",
        currentMonthKey: "2024-06",
      }),
    )

    expect(result.current.selectedMonth).toBe("2024-04")
    expect(result.current.canGoNext).toBe(true)
    expect(result.current.canGoPrev).toBe(true)
  })
})
