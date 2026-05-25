import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"
import { accountsRouter } from "@/server/api/routers/accounts"
import { categoriesRouter } from "@/server/api/routers/categories"
import { familyRouter } from "@/server/api/routers/family"
import { transactionsRouter } from "@/server/api/routers/transactions"

export const appRouter = createTRPCRouter({
  accounts: accountsRouter,
  categories: categoriesRouter,
  family: familyRouter,
  transactions: transactionsRouter,
})

export const createCaller = createCallerFactory(appRouter)

export type AppRouter = typeof appRouter
