import { describe, expect, test } from "vitest"

import {
  addMonths,
  compareMonthKeys,
  earlierMonthKey,
  formatMonthKey,
  previousMonthKey,
} from "./month-key"

describe("formatMonthKey", () => {
  test("pads single-digit month", () => {
    expect(formatMonthKey(new Date(2024, 0, 15))).toBe("2024-01")
  })

  test("keeps double-digit month unpadded", () => {
    expect(formatMonthKey(new Date(2024, 10, 1))).toBe("2024-11")
  })

  test("handles December", () => {
    expect(formatMonthKey(new Date(2024, 11, 31))).toBe("2024-12")
  })
})

describe("addMonths", () => {
  test("rolls over year forward", () => {
    expect(addMonths("2024-12", 1)).toBe("2025-01")
  })

  test("rolls over year backward", () => {
    expect(addMonths("2024-01", -1)).toBe("2023-12")
  })

  test("is idempotent for delta=0", () => {
    expect(addMonths("2024-06", 0)).toBe("2024-06")
  })

  test("does not skip February going backward", () => {
    expect(addMonths("2024-02", -1)).toBe("2024-01")
  })

  test("does not duplicate February going forward", () => {
    expect(addMonths("2024-02", 1)).toBe("2024-03")
  })

  test("shifts by many months", () => {
    expect(addMonths("2024-06", 7)).toBe("2025-01")
    expect(addMonths("2024-06", -7)).toBe("2023-11")
  })

  test("handles leap-year boundary correctly", () => {
    expect(addMonths("2024-02", 12)).toBe("2025-02")
  })
})

describe("previousMonthKey", () => {
  test("returns previous month", () => {
    expect(previousMonthKey("2024-06")).toBe("2024-05")
  })

  test("rolls year backward on January", () => {
    expect(previousMonthKey("2024-01")).toBe("2023-12")
  })
})

describe("compareMonthKeys", () => {
  test("returns -1 when a < b", () => {
    expect(compareMonthKeys("2024-01", "2024-02")).toBe(-1)
    expect(compareMonthKeys("2023-12", "2024-01")).toBe(-1)
  })

  test("returns 0 when equal", () => {
    expect(compareMonthKeys("2024-06", "2024-06")).toBe(0)
  })

  test("returns 1 when a > b", () => {
    expect(compareMonthKeys("2024-02", "2024-01")).toBe(1)
    expect(compareMonthKeys("2024-01", "2023-12")).toBe(1)
  })
})

describe("earlierMonthKey", () => {
  test("returns a when it is earlier", () => {
    expect(earlierMonthKey("2024-03", "2024-06")).toBe("2024-03")
  })

  test("returns b when it is earlier", () => {
    expect(earlierMonthKey("2026-06", "2024-04")).toBe("2024-04")
  })

  test("returns either when equal", () => {
    expect(earlierMonthKey("2024-06", "2024-06")).toBe("2024-06")
  })

  test("compares across years correctly", () => {
    expect(earlierMonthKey("2025-01", "2024-12")).toBe("2024-12")
  })
})
