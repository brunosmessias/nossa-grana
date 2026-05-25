import { z } from "zod"

export const accountTypeSchema = z.enum([
  "CHECKING",
  "SAVINGS",
  "CASH",
  "INVESTMENT",
  "CREDIT_CARD",
  "LOAN",
  "GOAL"
])

export const upsertAccountSchema = z.object({
  id: z.string().uuid().optional(),
  familyId: z.string().uuid(),
  name: z.string().min(2).max(80),
  type: accountTypeSchema,
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  initialBalanceCents: z.number().int(),
  archived: z.boolean().default(false),
  targetAmountCents: z.number().int().positive().optional(),
  targetDate: z.string().optional(),
})

export type UpsertAccountInput = z.infer<typeof upsertAccountSchema>
