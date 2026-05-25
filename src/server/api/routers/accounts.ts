import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  archiveAccount,
  getAccountsSummary,
  transferBetweenAccounts,
  upsertAccount,
} from "@/server/services/account-service"
import {
  archiveAccountSchema,
  transferBetweenAccountsSchema,
  upsertAccountSchema,
} from "@/shared/schemas/account"
import { familyIdSchema } from "@/shared/schemas/transaction"

export const accountsRouter = createTRPCRouter({
  list: protectedProcedure.input(familyIdSchema).query(async ({ ctx, input }) => {
    return getAccountsSummary(ctx.user.id, input.familyId)
  }),

  upsert: protectedProcedure.input(upsertAccountSchema).mutation(async ({ ctx, input }) => {
    return upsertAccount(ctx.user.id, input)
  }),

  archive: protectedProcedure.input(archiveAccountSchema).mutation(async ({ ctx, input }) => {
    return archiveAccount(ctx.user.id, input.familyId, input.accountId)
  }),

  transfer: protectedProcedure.input(transferBetweenAccountsSchema).mutation(async ({ ctx, input }) => {
    return transferBetweenAccounts({
      userId: ctx.user.id,
      familyId: input.familyId,
      fromAccountId: input.fromAccountId,
      toAccountId: input.toAccountId,
      amountCents: input.amountCents,
      description: input.description ?? "",
    })
  }),
})
