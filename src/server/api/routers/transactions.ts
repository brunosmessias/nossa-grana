import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  batchImportTransactions,
  createTransaction,
  deleteTransaction,
  listTransactions,
  listAllTransactions,
  updateTransaction,
} from "@/server/services/transaction-service"
import {
  batchImportTransactionSchema,
  createTransactionSchema,
  deleteTransactionSchema,
  familyIdSchema,
  listTransactionsSchema,
  updateTransactionSchema,
} from "@/shared/schemas/transaction"

export const transactionsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listTransactionsSchema)
    .query(async ({ ctx, input }) => {
      return listTransactions(ctx.user.id, input)
    }),

  listAll: protectedProcedure
    .input(familyIdSchema)
    .query(async ({ ctx, input }) => {
      return listAllTransactions(ctx.user.id, input.familyId)
    }),

  create: protectedProcedure.input(createTransactionSchema).mutation(async ({ ctx, input }) => {
    return createTransaction(ctx.user.id, input)
  }),

  update: protectedProcedure.input(updateTransactionSchema).mutation(async ({ ctx, input }) => {
    const { familyId, transactionId, ...rest } = input
    return updateTransaction(ctx.user.id, familyId, transactionId, rest)
  }),

  delete: protectedProcedure.input(deleteTransactionSchema).mutation(async ({ ctx, input }) => {
    return deleteTransaction(ctx.user.id, input.familyId, input.transactionId)
  }),

  batchImport: protectedProcedure
    .input(batchImportTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      return batchImportTransactions(ctx.user.id, input)
    }),
})
