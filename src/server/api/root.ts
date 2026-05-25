import { createTRPCRouter } from "@/server/api/trpc"
import { accountsRouter } from "@/server/api/routers/accounts"
import { familyRouter } from "@/server/api/routers/family"

export const appRouter = createTRPCRouter({
  accounts: accountsRouter,
  family: familyRouter,
})

export type AppRouter = typeof appRouter
