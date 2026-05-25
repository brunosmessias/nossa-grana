import { z } from "zod"

export const createTransactionSchema = z.object({
  familyId: z.string().uuid(),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(2).max(120),
  amountCents: z.number().int().positive(),
  transactionAt: z.string().datetime().optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

export const batchImportTransactionSchema = z.object({
  familyId: z.string().uuid(),
  accountId: z.string().uuid(),
  transactions: z
    .array(
      z.object({
        categoryId: z.string().uuid(),
        type: z.enum(["INCOME", "EXPENSE"]),
        description: z.string().min(2).max(120),
        amountCents: z.number().int().positive(),
        day: z.number().int().min(1).max(31),
      }),
    )
    .min(1)
    .max(200),
})

export type BatchImportTransactionInput = z.infer<
  typeof batchImportTransactionSchema
>

export const updateTransactionSchema = z.object({
  familyId: z.string().uuid(),
  transactionId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  description: z.string().min(2).max(120).optional(),
  amountCents: z.number().int().positive().optional(),
  transactionAt: z.string().datetime().optional(),
})

export const deleteTransactionSchema = z.object({
  familyId: z.string().uuid(),
  transactionId: z.string().uuid(),
})

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

export const orderBySchema = z.object({
  orderBy: z.enum(["transactionAt", "amountCents", "description"]).default("transactionAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
})

export const listTransactionsSchema = paginationSchema
  .merge(orderBySchema)
  .extend({
    familyId: z.string().uuid(),
    search: z.string().optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    accountId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  })

export const familyIdSchema = z.object({
  familyId: z.string().uuid(),
})
