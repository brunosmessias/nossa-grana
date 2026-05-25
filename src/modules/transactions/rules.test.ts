import { describe, expect, test } from "vitest"

function canCreateTransaction(amountCents: number): boolean {
  return Number.isInteger(amountCents) && amountCents > 0
}

describe("transaction rules", () => {
  test("rejects non-positive values", () => {
    expect(canCreateTransaction(0)).toBe(false)
    expect(canCreateTransaction(-1)).toBe(false)
  })

  test("accepts positive integers", () => {
    expect(canCreateTransaction(1)).toBe(true)
  })
})
