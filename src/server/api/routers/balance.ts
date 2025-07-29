import { z } from "zod"
import { and, eq, lte, sql } from "drizzle-orm"
import { transactions } from "@/src/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/src/server/api/trpc"

export const balanceRouter = createTRPCRouter({
  getAccumulatedBalance: protectedProcedure
    .input(
      z.object({
        year: z.number().min(2000).max(2100),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const endOfMonth = new Date(input.year, input.month, 0, 23, 59, 59)
      const toUTCTimestamp = (date: Date) => Math.floor(date.getTime() / 1000)
      const result = await ctx.db
        .select({
          currentPaid: sql<number>`
            SUM(CASE
              WHEN ${transactions.isPaid} = 1
                AND ${transactions.transactionDate} <= ${toUTCTimestamp(endOfMonth)}
              THEN 
                CASE ${transactions.type}
                  WHEN 'INCOME' THEN ${transactions.amountCents}
                  WHEN 'EXPENSE' THEN -${transactions.amountCents}
                END
              ELSE 0
            END)`,
          projected: sql<number>`
            SUM(CASE
              WHEN ${transactions.transactionDate} <= ${toUTCTimestamp(endOfMonth)}
              THEN 
                CASE ${transactions.type}
                  WHEN 'INCOME' THEN ${transactions.amountCents}
                  WHEN 'EXPENSE' THEN -${transactions.amountCents}
                END
              ELSE 0
            END)`,
        })
        .from(transactions)
        .where(
          and(
            eq(
              transactions.familyId,
              ctx.session.sessionClaims.metadata!.familyId!
            ),
            lte(transactions.transactionDate, endOfMonth)
          )
        )

      return result[0] || { currentPaid: 0, projected: 0 }
    }),
})
