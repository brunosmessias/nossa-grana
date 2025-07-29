import { familyRouter } from "@/src/server/api/routers/family"
import { createCallerFactory, createTRPCRouter } from "@/src/server/api/trpc"
import { transactionRouter } from "@/src/server/api/routers/transaction"
import { balanceRouter } from "@/src/server/api/routers/balance"
import { categoryRouter } from "@/src/server/api/routers/category"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  family: familyRouter,
  transaction: transactionRouter,
  balance: balanceRouter,
  category: categoryRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
