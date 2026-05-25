import { and, desc, eq, inArray, sql } from "drizzle-orm"

import { auditEvents } from "@/server/audit/events"
import { writeAuditLog } from "@/server/audit/write-audit"
import { db } from "@/server/db/client"
import { accounts, categories, familyInvites, familyMembers, transactions } from "@/server/db/schema"
import type { UpsertAccountInput } from "@/shared/schemas/account"
import type { CreateCategoryInput } from "@/shared/schemas/category"
import type { CreateTransactionInput } from "@/shared/schemas/transaction"
import type { BatchImportTransactionInput } from "@/shared/schemas/transaction"

export async function assertFamilyMember(familyId: string, userId: string) {
  const member = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, familyId), eq(familyMembers.userId, userId)),
  })

  if (!member) {
    throw new Error("Forbidden")
  }

  return member
}

export async function listMvpData(userId: string, familyId: string) {
  await assertFamilyMember(familyId, userId)

  const [accountRows, categoryRows, transactionRows, memberRows, inviteRows] = await Promise.all([
    db.select().from(accounts).where(eq(accounts.familyId, familyId)),
    db.select().from(categories).where(eq(categories.familyId, familyId)),
    db
      .select()
      .from(transactions)
      .where(eq(transactions.familyId, familyId))
      .orderBy(desc(transactions.transactionAt)),
    db
      .select({ userId: familyMembers.userId, role: familyMembers.role })
      .from(familyMembers)
      .where(eq(familyMembers.familyId, familyId)),
    db
      .select({ id: familyInvites.id, email: familyInvites.email, status: familyInvites.status })
      .from(familyInvites)
      .where(eq(familyInvites.familyId, familyId)),
  ])

  const accountIds = accountRows.map((item) => item.id)
  let balancesByAccountId = new Map<string, number>()
  if (accountIds.length > 0) {
    const balanceRows = await db
      .select({
        accountId: transactions.accountId,
        income: sql<number>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amountCents} else 0 end), 0)`,
        expense: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amountCents} else 0 end), 0)`,
      })
      .from(transactions)
      .where(inArray(transactions.accountId, accountIds))
      .groupBy(transactions.accountId)

    balancesByAccountId = new Map(
      balanceRows.map((row) => [row.accountId, row.income - row.expense]),
    )
  }

  const accountWithBalance = accountRows.map((account) => ({
    ...account,
    balanceCents: account.initialBalanceCents + (balancesByAccountId.get(account.id) ?? 0),
  }))

  const totalBalanceCents = accountWithBalance
    .filter((account) => !account.archived)
    .reduce((sum, account) => sum + account.balanceCents, 0)

  return {
    accounts: accountWithBalance,
    categories: categoryRows,
    transactions: transactionRows,
    members: memberRows,
    invites: inviteRows,
    summary: { totalBalanceCents },
  }
}

export async function upsertAccount(userId: string, input: UpsertAccountInput) {
  await assertFamilyMember(input.familyId, userId)

  if (input.id) {
    const current = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, input.id), eq(accounts.familyId, input.familyId)),
    })

    if (!current) {
      throw new Error("Account not found")
    }

    await db
      .update(accounts)
      .set({
        name: input.name,
        type: input.type,
        icon: input.icon,
        color: input.color,
        initialBalanceCents: input.initialBalanceCents,
        archived: input.archived,
        targetAmountCents: input.targetAmountCents ?? null,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, input.id))

    await writeAuditLog({
      event: auditEvents.accountUpdated,
      actorId: userId,
      entity: "account",
      entityId: input.id,
      reason: "manual-update",
      before: current,
      after: input,
      source: "api",
      requestId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })

    return { id: input.id }
  }

  const [created] = await db
    .insert(accounts)
    .values({
      familyId: input.familyId,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
      initialBalanceCents: input.initialBalanceCents,
      archived: input.archived,
      targetAmountCents: input.targetAmountCents ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    })
    .returning({ id: accounts.id })

  await writeAuditLog({
    event: auditEvents.accountCreated,
    actorId: userId,
    entity: "account",
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

export async function archiveAccount(userId: string, familyId: string, accountId: string) {
  await assertFamilyMember(familyId, userId)

  const [updated] = await db
    .update(accounts)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(accounts.id, accountId), eq(accounts.familyId, familyId)))
    .returning({ id: accounts.id })

  if (!updated) {
    throw new Error("Account not found")
  }

  await writeAuditLog({
    event: auditEvents.accountArchived,
    actorId: userId,
    entity: "account",
    entityId: accountId,
    reason: "manual-archive",
    before: null,
    after: { archived: true },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return updated
}

export async function createCategory(userId: string, input: CreateCategoryInput) {
  await assertFamilyMember(input.familyId, userId)

  const [created] = await db
    .insert(categories)
    .values({ familyId: input.familyId, name: input.name, kind: input.kind, icon: input.icon, color: input.color, monthlyBudgetCents: input.monthlyBudgetCents ?? null })
    .returning({ id: categories.id })

  return created
}

export async function deleteCategory(userId: string, familyId: string, categoryId: string) {
  await assertFamilyMember(familyId, userId)

  const linked = await db.query.transactions.findFirst({
    where: and(eq(transactions.familyId, familyId), eq(transactions.categoryId, categoryId)),
  })

  if (linked) {
    throw new Error("Category has linked transactions")
  }

  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.familyId, familyId)))
    .returning({ id: categories.id })

  if (!deleted) {
    throw new Error("Category not found")
  }

  return deleted
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

export async function updateCategory(
  userId: string,
  familyId: string,
  categoryId: string,
  input: {
    name?: string
    icon?: string
    color?: string
    monthlyBudgetCents?: number | null
  },
) {
  await assertFamilyMember(familyId, userId)

  const current = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.familyId, familyId)),
  })

  if (!current) {
    throw new Error("Categoria não encontrada")
  }

  const updates: Record<string, unknown> = {}
  if (input.name !== undefined) updates.name = input.name
  if (input.icon !== undefined) updates.icon = input.icon
  if (input.color !== undefined) updates.color = input.color
  if (input.monthlyBudgetCents !== undefined) updates.monthlyBudgetCents = input.monthlyBudgetCents

  await db
    .update(categories)
    .set(updates)
    .where(and(eq(categories.id, categoryId), eq(categories.familyId, familyId)))

  await writeAuditLog({
    event: auditEvents.categoryUpdated,
    actorId: userId,
    entity: "category",
    entityId: categoryId,
    reason: "manual-update",
    before: current,
    after: { ...current, ...updates },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return { id: categoryId }
}

export async function transferBetweenAccounts(params: {
  userId: string
  familyId: string
  fromAccountId: string
  toAccountId: string
  amountCents: number
  description: string
}) {
  await assertFamilyMember(params.familyId, params.userId)

  const fromAccount = await db.query.accounts.findFirst({
    where: and(eq(accounts.id, params.fromAccountId), eq(accounts.familyId, params.familyId)),
  })

  if (!fromAccount) {
    throw new Error("Conta origem não encontrada")
  }

  const toAccount = await db.query.accounts.findFirst({
    where: and(eq(accounts.id, params.toAccountId), eq(accounts.familyId, params.familyId)),
  })

  if (!toAccount) {
    throw new Error("Conta destino não encontrada")
  }

  const description = params.description || `Transferência para ${toAccount.name}`

  const [expenseCat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.familyId, params.familyId), eq(categories.kind, "EXPENSE")))
    .limit(1)

  const [incomeCat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.familyId, params.familyId), eq(categories.kind, "INCOME")))
    .limit(1)

  if (!expenseCat || !incomeCat) {
    throw new Error("Crie categorias de receita e despesa antes de transferir")
  }

  await db.insert(transactions).values([
    {
      familyId: params.familyId,
      accountId: params.fromAccountId,
      categoryId: expenseCat.id,
      type: "EXPENSE",
      description,
      amountCents: params.amountCents,
    },
    {
      familyId: params.familyId,
      accountId: params.toAccountId,
      categoryId: incomeCat.id,
      type: "INCOME",
      description: `Transferência de ${fromAccount.name}`,
      amountCents: params.amountCents,
    },
  ])

  return { ok: true }
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
