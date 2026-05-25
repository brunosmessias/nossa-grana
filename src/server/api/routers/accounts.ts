import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { upsertAccountSchema } from "@/shared/schemas/account"

export const accountsRouter = createTRPCRouter({
  upsert: protectedProcedure.input(upsertAccountSchema).mutation(async ({ input }) => {
    return {
      ok: true,
      account: input,
    }
  }),
})
