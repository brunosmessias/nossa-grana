"use client"

import { useCallback } from "react"
import { api } from "@/trpc/react"

export function useInvalidateQueries() {
  const utils = api.useUtils()

  return useCallback(async (scopes: Array<"accounts" | "categories" | "transactions"> = ["accounts", "categories", "transactions"]) => {
    const promises: Promise<unknown>[] = []

    if (scopes.includes("accounts")) {
      promises.push(utils.accounts.list.invalidate())
    }
    if (scopes.includes("categories")) {
      promises.push(utils.categories.list.invalidate())
    }
    if (scopes.includes("transactions")) {
      promises.push(utils.transactions.list.invalidate())
      promises.push(utils.transactions.listAll.invalidate())
    }

    await Promise.all(promises)
  }, [utils])
}
