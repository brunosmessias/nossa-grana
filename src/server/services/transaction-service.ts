import { and, asc, desc, eq, ilike, sql } from "drizzle-orm"

import { auditEvents } from "@/server/audit/events"
import { writeAuditLog } from "@/server/audit/write-audit"
import { db } from "@/server/db/client"
import { transactions } from "@/server/db/schema"
import type { CreateTransactionInput, BatchImportTransactionInput } from "@/shared/schemas/transaction"
import { assertFamilyMember } from "./auth-service"

export type ListTransactionsInput = {
  familyId: string
  page?: number
  pageSize?: number
  orderBy?: "transactionAt" | "amountCents" | "description"
  orderDir?: "asc" | "desc"
  search?: string
  type?: "INCOME" | "EXPENSE"
  accountId?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
}

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function listTransactions(
  userId: string,
  input: ListTransactionsInput,
): Promise<PaginatedResult<typeof transactions.$inferSelect>> {
  await assertFamilyMember(input.familyId, userId)

  const page = input.page ?? 1
  const pageSize = input.pageSize ?? 20
  const offset = (page - 1) * pageSize
  const orderBy = input.orderBy ?? "transactionAt"
  const orderDir = input.orderDir ?? "desc"

  const conditions = [eq(transactions.familyId, input.familyId)]

  if (input.type) {
    conditions.push(eq(transactions.type, input.type))
  }
  if (input.accountId) {
    conditions.push(eq(transactions.accountId, input.accountId))
  }
  if (input.categoryId) {
    conditions.push(eq(transactions.categoryId, input.categoryId))
  }
  if (input.search) {
    conditions.push(ilike(transactions.description, `%${input.search}%`))
  }
  if (input.dateFrom) {
    conditions.push(sql`${transactions.transactionAt} >= ${input.dateFrom}`)
  }
  if (input.dateTo) {
    const upperBound = input.dateTo.length <= 10
      ? `${input.dateTo}T23:59:59.999`
      : input.dateTo
    conditions.push(sql`${transactions.transactionAt} <= ${upperBound}`)
  }

  const where = and(...conditions)

  const orderCol = (() => {
    switch (orderBy) {
      case "amountCents": return transactions.amountCents
      case "description": return transactions.description
      default: return transactions.transactionAt
    }
  })()

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(orderDir === "asc" ? asc(orderCol) : desc(orderCol))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(transactions)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function listAllTransactions(userId: string, familyId: string) {
  await assertFamilyMember(familyId, userId)

  return db
    .select()
    .from(transactions)
    .where(eq(transactions.familyId, familyId))
    .orderBy(desc(transactions.transactionAt))
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  await assertFamilyMember(input.familyId, userId)

  const [created] = await db
    .insert(transactions)
    .values({
      familyId: input.familyId,
      accountId: input.accountId,
      categoryId: input.categoryId,
      type: input.type,
      description: input.description,
      amountCents: input.amountCents,
      transactionAt: input.transactionAt ? new Date(input.transactionAt) : new Date(),
    })
    .returning({ id: transactions.id })

  await writeAuditLog({
    event: auditEvents.transactionCreated,
    actorId: userId,
    entity: "transaction",
    entityId: created.id,
    reason: "manual-create",
    before: null,
    after: input,
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return created
}

export async function updateTransaction(
  userId: string,
  familyId: string,
  transactionId: string,
  input: {
    accountId?: string
    categoryId?: string
    description?: string
    amountCents?: number
    transactionAt?: string
  },
) {
  await assertFamilyMember(familyId, userId)

  const current = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, transactionId), eq(transactions.familyId, familyId)),
  })

  if (!current) {
    throw new Error("Transação não encontrada")
  }

  const updates: Record<string, unknown> = {}
  if (input.accountId !== undefined) updates.accountId = input.accountId
  if (input.categoryId !== undefined) updates.categoryId = input.categoryId
  if (input.description !== undefined) updates.description = input.description
  if (input.amountCents !== undefined) updates.amountCents = input.amountCents
  if (input.transactionAt !== undefined) updates.transactionAt = new Date(input.transactionAt)

  await db
    .update(transactions)
    .set(updates)
    .where(eq(transactions.id, transactionId))

  await writeAuditLog({
    event: auditEvents.transactionUpdated,
    actorId: userId,
    entity: "transaction",
    entityId: transactionId,
    reason: "manual-update",
    before: current,
    after: { ...current, ...updates },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return { id: transactionId }
}

export async function deleteTransaction(userId: string, familyId: string, transactionId: string) {
  await assertFamilyMember(familyId, userId)

  const current = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, transactionId), eq(transactions.familyId, familyId)),
  })

  if (!current) {
    throw new Error("Transação não encontrada")
  }

  await db
    .delete(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.familyId, familyId)))

  await writeAuditLog({
    event: auditEvents.transactionDeleted,
    actorId: userId,
    entity: "transaction",
    entityId: transactionId,
    reason: "manual-delete",
    before: current,
    after: null,
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return { id: transactionId }
}

export async function batchImportTransactions(
  userId: string,
  input: BatchImportTransactionInput,
) {
  await assertFamilyMember(input.familyId, userId)

  const now = new Date()
  const targetYear = now.getFullYear()
  const targetMonth = now.getMonth()

  const values = input.transactions.map((tx) => ({
    familyId: input.familyId,
    accountId: input.accountId,
    categoryId: tx.categoryId,
    type: tx.type,
    description: tx.description,
    amountCents: tx.amountCents,
    transactionAt: new Date(targetYear, targetMonth, tx.day, 12, 0, 0),
  }))

  await db.insert(transactions).values(values)

  await writeAuditLog({
    event: auditEvents.transactionsBatchImported,
    actorId: userId,
    entity: "transaction",
    entityId: "batch",
    reason: "batch-import",
    before: null,
    after: { count: values.length, accountId: input.accountId },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return { count: values.length }
}
