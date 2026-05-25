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
