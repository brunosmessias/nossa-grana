import { z } from "zod"

export const categoryKindSchema = z.enum(["INCOME", "EXPENSE"])

export const createCategorySchema = z.object({
  familyId: z.string().uuid(),
  name: z.string().min(2).max(60),
  kind: categoryKindSchema,
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  monthlyBudgetCents: z.number().int().positive().optional(),
})

export const deleteCategorySchema = z.object({
  familyId: z.string().uuid(),
  categoryId: z.string().uuid(),
})

export const updateCategorySchema = z.object({
  familyId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(60).optional(),
  icon: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  monthlyBudgetCents: z.number().int().optional().nullable(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
