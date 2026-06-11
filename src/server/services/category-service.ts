import { and, eq } from "drizzle-orm"

import { auditEvents } from "@/server/audit/events"
import { writeAuditLog } from "@/server/audit/write-audit"
import { db } from "@/server/db/client"
import { categories, transactions } from "@/server/db/schema"
import type { CreateCategoryInput } from "@/shared/schemas/category"
import { assertFamilyMember, type FamilyMembership } from "./auth-service"

export async function listCategories(
  userId: string,
  familyId: string,
  membership?: FamilyMembership,
) {
  await assertFamilyMember(familyId, userId, membership)

  return db
    .select()
    .from(categories)
    .where(eq(categories.familyId, familyId))
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
  membership?: FamilyMembership,
) {
  await assertFamilyMember(input.familyId, userId, membership)

  const [created] = await db
    .insert(categories)
    .values({ familyId: input.familyId, name: input.name, kind: input.kind, icon: input.icon, color: input.color, monthlyBudgetCents: input.monthlyBudgetCents ?? null })
    .returning({ id: categories.id })

  return created
}

export async function deleteCategory(
  userId: string,
  familyId: string,
  categoryId: string,
  membership?: FamilyMembership,
) {
  await assertFamilyMember(familyId, userId, membership)

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
  membership?: FamilyMembership,
) {
  await assertFamilyMember(familyId, userId, membership)

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
