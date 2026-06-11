import { and, eq, inArray, sql } from "drizzle-orm"

import { auditEvents } from "@/server/audit/events"
import { writeAuditLog } from "@/server/audit/write-audit"
import { db } from "@/server/db/client"
import { accounts, categories, transactions } from "@/server/db/schema"
import type { UpsertAccountInput } from "@/shared/schemas/account"
import { assertFamilyMember, type FamilyMembership } from "./auth-service"

export async function listAccounts(
  userId: string,
  familyId: string,
  membership?: FamilyMembership,
) {
  await assertFamilyMember(familyId, userId, membership)

  const accountRows = await db
    .select()
    .from(accounts)
    .where(eq(accounts.familyId, familyId))

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
      .where(
        and(
          inArray(transactions.accountId, accountIds),
          eq(transactions.paid, true),
        ),
      )
      .groupBy(transactions.accountId)

    balancesByAccountId = new Map(
      balanceRows.map((row) => [row.accountId, row.income - row.expense]),
    )
  }

  return accountRows.map((account) => ({
    ...account,
    balanceCents: account.initialBalanceCents + (balancesByAccountId.get(account.id) ?? 0),
  }))
}

export async function getAccountsSummary(
  userId: string,
  familyId: string,
  membership?: FamilyMembership,
) {
  const accountWithBalance = await listAccounts(userId, familyId, membership)

  const totalBalanceCents = accountWithBalance
    .filter((account) => !account.archived)
    .reduce((sum, account) => sum + account.balanceCents, 0)

  return { accounts: accountWithBalance, totalBalanceCents }
}

export async function upsertAccount(
  userId: string,
  input: UpsertAccountInput,
  membership?: FamilyMembership,
) {
  await assertFamilyMember(input.familyId, userId, membership)

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

export async function archiveAccount(
  userId: string,
  familyId: string,
  accountId: string,
  membership?: FamilyMembership,
) {
  await assertFamilyMember(familyId, userId, membership)

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

export async function transferBetweenAccounts(params: {
  userId: string
  familyId: string
  fromAccountId: string
  toAccountId: string
  amountCents: number
  description: string
  membership?: FamilyMembership
}) {
  await assertFamilyMember(params.familyId, params.userId, params.membership)

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
