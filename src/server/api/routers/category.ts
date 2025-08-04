import { z } from "zod"
import { and, desc, eq, gte, sql } from "drizzle-orm"
import { categories, transactions } from "@/src/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/src/server/api/trpc"
import { getDB } from "@/src/server/db"

const categoryData = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string(),
})
export type CategoryType = z.infer<typeof categoryData>

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(categories)
      .where(
        eq(categories.familyId, ctx.session.sessionClaims.metadata!.familyId!)
      )
  }),

  getAllWithStats: protectedProcedure.query(async ({ ctx }) => {
    const [categories, chartData] = await Promise.all([
      getCategoryWithStats(ctx.session.sessionClaims.metadata!.familyId!),
      getCategoryWithStatsByMonth(
        ctx.session.sessionClaims.metadata!.familyId!
      ),
    ])

    const categoryConfig = categories
      .filter((c) => c.type === "EXPENSE")
      .reduce(
        (acc, category) => {
          acc[category.name.toLowerCase().replace(/\s+/g, "_")] = {
            id: category.id,
            label: category.name,
            color: category.color || "#gray-500",
          }
          return acc
        },
        {} as Record<string, any>
      )

    return {
      categories,
      chartData,
      categoryConfig,
    }
  }),

  upsert: protectedProcedure
    .input(categoryData)
    .mutation(async ({ ctx, input }) => {
      const data = {
        ...input,
        familyId: ctx.session.sessionClaims.metadata!.familyId!,
      }

      return ctx.db
        .insert(categories)
        .values(data)
        .onConflictDoUpdate({
          target: categories.id,
          set: data,
        })
        .returning()
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(categories)
        .where(
          and(
            eq(categories.id, input.id),
            eq(
              categories.familyId,
              ctx.session.sessionClaims.metadata!.familyId!
            )
          )
        )
    }),
})

async function getCategoryWithStats(familyId: string) {
  const inicioMesAtual = new Date()
  inicioMesAtual.setDate(1)
  inicioMesAtual.setHours(0, 0, 0, 0)

  const resultado = await getDB()
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      icon: categories.icon,
      color: categories.color,
      totalAmountCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`,
      quantityTransactions: sql<number>`COALESCE(COUNT(${transactions.id}), 0)`,
    })
    .from(categories)
    .leftJoin(
      transactions,
      and(
        eq(transactions.categoryId, categories.id),
        gte(transactions.transactionDate, inicioMesAtual)
      )
    )
    .where(eq(categories.familyId, familyId))
    .groupBy(categories.id)
    .orderBy(desc(sql`COALESCE(SUM(${transactions.amountCents}), 0)`))

  return resultado.map((row) => ({
    ...row,
    type: row.type as "INCOME" | "EXPENSE",
  }))
}

async function getCategoryWithStatsByMonth(familyId: string) {
  const seisMesesAtras = new Date()
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
  seisMesesAtras.setDate(1)
  seisMesesAtras.setHours(0, 0, 0, 0)

  const resultado = await getDB()
    .select({
      ano: sql<number>`strftime('%Y', datetime(${transactions.transactionDate}, 'unixepoch'))`,
      mes: sql<number>`strftime('%m', datetime(${transactions.transactionDate}, 'unixepoch'))`,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      totalCentavos: sql<number>`SUM(${transactions.amountCents})`,
    })
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(
      and(
        eq(categories.familyId, familyId),
        gte(transactions.transactionDate, seisMesesAtras),
        eq(categories.type, "EXPENSE")
      )
    )
    .groupBy(
      sql`strftime('%Y-%m', datetime(${transactions.transactionDate}, 'unixepoch'))`,
      transactions.categoryId
    )
    .orderBy(
      sql`strftime('%Y-%m', datetime(${transactions.transactionDate}, 'unixepoch'))`
    )

  const mesesMap = new Map<string, Record<string, number>>()

  for (const row of resultado) {
    const mesFormatado = new Date(row.ano, row.mes - 1).toLocaleDateString(
      "pt-BR",
      {
        month: "short",
      }
    )

    if (!mesesMap.has(mesFormatado)) {
      mesesMap.set(mesFormatado, {})
    }

    const categoriaKey = row.categoryName.toLowerCase().replace(/\s+/g, "_")
    mesesMap.get(mesFormatado)![categoriaKey] = Math.round(row.totalCentavos)
  }

  return Array.from(mesesMap.entries()).map(([mes, categorias]) => ({
    ...categorias,
    mes,
  }))
}
