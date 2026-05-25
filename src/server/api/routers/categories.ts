import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/server/services/category-service"
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "@/shared/schemas/category"
import { familyIdSchema } from "@/shared/schemas/transaction"

export const categoriesRouter = createTRPCRouter({
  list: protectedProcedure.input(familyIdSchema).query(async ({ ctx, input }) => {
    return listCategories(ctx.user.id, input.familyId)
  }),

  create: protectedProcedure.input(createCategorySchema).mutation(async ({ ctx, input }) => {
    return createCategory(ctx.user.id, input)
  }),

  delete: protectedProcedure.input(deleteCategorySchema).mutation(async ({ ctx, input }) => {
    return deleteCategory(ctx.user.id, input.familyId, input.categoryId)
  }),

  update: protectedProcedure.input(updateCategorySchema).mutation(async ({ ctx, input }) => {
    const { familyId, categoryId, ...rest } = input
    return updateCategory(ctx.user.id, familyId, categoryId, rest)
  }),
})
