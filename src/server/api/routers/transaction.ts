import { z } from "zod"
import { and, eq, gte, lte, sql } from "drizzle-orm"
import { categories, familyMembers, transactions } from "@/src/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/src/server/api/trpc"
import { parseCurrencyToCents } from "@/src/app/_components/utils/currency"

const transactionData = z.object({
  id: z.string().optional(),
  description: z.string(),
  categoryId: z.string(),
  amountCents: z.string(),
  transactionDate: z.date(),
  isPaid: z.boolean(),
})
export type TransactionType = z.infer<typeof transactionData>

export const transactionRouter = createTRPCRouter({
  getByMonth: protectedProcedure
    .input(
      z.object({
        year: z.number().min(2000).max(2100),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const familyId = ctx.session.sessionClaims.metadata!.familyId

      const startDate = new Date(input.year, input.month - 1, 1)
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59)

      return await ctx.db
        .select({
          id: transactions.id,
          description: transactions.description,
          amountCents: transactions.amountCents,
          type: transactions.type,
          isPaid: transactions.isPaid,
          transactionDate: transactions.transactionDate,
          category: sql`json_object
            ('id', categories.id, 'name', categories.name, 'color', categories.color, 'icon', categories.icon)`.mapWith(
            (val) => (val ? JSON.parse(val) : null)
          ),
          createdBy: sql`json_object
          ('name',
          ${familyMembers.name}
          )`.mapWith((val) => JSON.parse(val)),
        })
        .from(transactions)
        .leftJoin(
          familyMembers,
          eq(transactions.createdBy, familyMembers.email)
        )
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(transactions.familyId, familyId as string),
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate)
          )
        )
        .orderBy(transactions.transactionDate)
    }),

  upsert: protectedProcedure
    .input(transactionData)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.query.categories.findFirst({
        where: eq(categories.id, input.categoryId),
      })

      if (!category) {
        throw new Error("Categoria não encontrada")
      }

      const transactionData = {
        ...input,
        familyId: ctx.session.sessionClaims.metadata!.familyId!,
        createdBy: ctx.session.sessionClaims.email,
        amountCents: parseCurrencyToCents(input.amountCents),
        type: category.type,
      }

      const result = await ctx.db
        .insert(transactions)
        .values(transactionData)
        .onConflictDoUpdate({
          target: transactions.id,
          set: transactionData,
        })
        .returning()

      return result[0]
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(transactions)
        .where(
          and(
            eq(transactions.id, input.id),
            eq(
              transactions.familyId,
              ctx.session.sessionClaims.metadata!.familyId!
            )
          )
        )
    }),
})
