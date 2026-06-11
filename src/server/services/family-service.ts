import { and, eq, inArray } from "drizzle-orm"

import { writeAuditLog } from "@/server/audit/write-audit"
import { db } from "@/server/db/client"
import { families, familyInvites, familyMembers, user } from "@/server/db/schema"
import { sendEmail } from "@/server/email/sender"
import { familyInviteTemplate } from "@/server/email/templates"

export async function getUserFamilyId(userId: string): Promise<string | null> {
  const membership = await db.query.familyMembers.findFirst({
    where: eq(familyMembers.userId, userId),
  })
  return membership?.familyId ?? null
}

export async function getFamilyCreatedAt(
  familyId: string,
): Promise<Date | null> {
  const family = await db.query.families.findFirst({
    where: eq(families.id, familyId),
    columns: { createdAt: true },
  })
  return family?.createdAt ?? null
}

export async function createFamily(params: {
  userId: string
  familyName: string
}): Promise<{ familyId: string }> {
  const existing = await getUserFamilyId(params.userId)
  if (existing) {
    throw new Error("Você já possui uma família")
  }

  const [family] = await db
    .insert(families)
    .values({
      name: params.familyName,
      ownerUserId: params.userId,
    })
    .returning({ id: families.id, name: families.name })

  await db.insert(familyMembers).values({
    familyId: family.id,
    userId: params.userId,
    role: "OWNER",
  })

  await writeAuditLog({
    event: "family.created",
    actorId: params.userId,
    entity: "family",
    entityId: family.id,
    reason: "self-onboarding",
    before: null,
    after: { name: family.name },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return { familyId: family.id }
}

export async function inviteMemberByEmail(params: {
  familyId: string
  invitedByUserId: string
  invitedByName: string
  email: string
  appUrl: string
}): Promise<{ inviteId: string; token: string }> {
  const token = crypto.randomUUID().replace(/-/g, "")
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

  const [invite] = await db
    .insert(familyInvites)
    .values({
      familyId: params.familyId,
      invitedByUserId: params.invitedByUserId,
      email: params.email.toLowerCase(),
      token,
      expiresAt,
    })
    .returning({ id: familyInvites.id })

  const family = await db.query.families.findFirst({
    where: eq(families.id, params.familyId),
  })

  if (!family) {
    throw new Error("Family not found")
  }

  const template = familyInviteTemplate({
    familyName: family.name,
    inviterName: params.invitedByName,
    inviteUrl: `${params.appUrl}/family/invite/${token}`,
  })

  await sendEmail({
    to: params.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })

  await writeAuditLog({
    event: "family.member.invited",
    actorId: params.invitedByUserId,
    entity: "family_invite",
    entityId: invite.id,
    reason: "family-growth",
    before: null,
    after: { familyId: params.familyId, email: params.email.toLowerCase() },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return { inviteId: invite.id, token }
}

export async function acceptInvite(params: {
  token: string
  userId: string
  userEmail: string
}): Promise<{ familyId: string }> {
  const invite = await db.query.familyInvites.findFirst({
    where: eq(familyInvites.token, params.token),
  })

  if (!invite) {
    throw new Error("Invite not found")
  }

  if (invite.status !== "PENDING") {
    throw new Error("Invite is not pending")
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new Error("Invite expired")
  }

  if (invite.email !== params.userEmail.toLowerCase()) {
    throw new Error("Invite email mismatch")
  }

  const existingMembership = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, invite.familyId), eq(familyMembers.userId, params.userId)),
  })

  if (!existingMembership) {
    await db.insert(familyMembers).values({
      familyId: invite.familyId,
      userId: params.userId,
      role: "MEMBER",
    })
  }

  await db
    .update(familyInvites)
    .set({ status: "ACCEPTED", acceptedAt: new Date() })
    .where(eq(familyInvites.id, invite.id))

  await writeAuditLog({
    event: "family.invite.accepted",
    actorId: params.userId,
    entity: "family_invite",
    entityId: invite.id,
    reason: "invite-accepted",
    before: { status: "PENDING" },
    after: { status: "ACCEPTED" },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  return { familyId: invite.familyId }
}

export async function updateFamilyName(params: {
  familyId: string
  userId: string
  name: string
}) {
  const member = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, params.familyId), eq(familyMembers.userId, params.userId)),
  })

  if (!member || member.role !== "OWNER") {
    throw new Error("Apenas o proprietário pode editar a família")
  }

  const family = await db.query.families.findFirst({
    where: eq(families.id, params.familyId),
  })

  if (!family) {
    throw new Error("Família não encontrada")
  }

  await db
    .update(families)
    .set({ name: params.name, updatedAt: new Date() })
    .where(eq(families.id, params.familyId))

  await writeAuditLog({
    event: "family.updated",
    actorId: params.userId,
    entity: "family",
    entityId: params.familyId,
    reason: "rename",
    before: { name: family.name },
    after: { name: params.name },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })
}

export async function removeFamilyMember(params: {
  familyId: string
  actorUserId: string
  targetUserId: string
}) {
  const actor = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, params.familyId), eq(familyMembers.userId, params.actorUserId)),
  })

  if (!actor || (actor.role !== "OWNER" && actor.role !== "ADMIN")) {
    throw new Error("Sem permissão para remover membros")
  }

  const target = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, params.familyId), eq(familyMembers.userId, params.targetUserId)),
  })

  if (!target) {
    throw new Error("Membro não encontrado")
  }

  if (target.role === "OWNER") {
    throw new Error("O proprietário não pode ser removido. Transfira a propriedade primeiro.")
  }

  if (target.role === "ADMIN" && actor.role === "ADMIN") {
    throw new Error("Sem permissão para remover o proprietário")
  }

  await db
    .delete(familyMembers)
    .where(and(eq(familyMembers.familyId, params.familyId), eq(familyMembers.userId, params.targetUserId)))

  await writeAuditLog({
    event: "family.member.removed",
    actorId: params.actorUserId,
    entity: "family_member",
    entityId: params.targetUserId,
    reason: "manual-remove",
    before: { role: target.role },
    after: null,
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })
}

export async function revokeInvite(params: {
  familyId: string
  actorUserId: string
  inviteId: string
}) {
  const actor = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, params.familyId), eq(familyMembers.userId, params.actorUserId)),
  })

  if (!actor || (actor.role !== "OWNER" && actor.role !== "ADMIN")) {
    throw new Error("Sem permissão para revogar convites")
  }

  const invite = await db.query.familyInvites.findFirst({
    where: and(eq(familyInvites.id, params.inviteId), eq(familyInvites.familyId, params.familyId)),
  })

  if (!invite) {
    throw new Error("Convite não encontrado")
  }

  await db
    .update(familyInvites)
    .set({ status: "EXPIRED" })
    .where(eq(familyInvites.id, params.inviteId))

  await writeAuditLog({
    event: "family.invite.revoked",
    actorId: params.actorUserId,
    entity: "family_invite",
    entityId: params.inviteId,
    reason: "manual-revoke",
    before: { status: invite.status },
    after: { status: "EXPIRED" },
    source: "api",
    requestId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })
}

export async function getFamilyDetails(params: {
  familyId: string
  userId: string
}) {
  const member = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, params.familyId), eq(familyMembers.userId, params.userId)),
  })

  if (!member) {
    throw new Error("Forbidden")
  }

  const family = await db.query.families.findFirst({
    where: eq(families.id, params.familyId),
  })

  if (!family) {
    throw new Error("Família não encontrada")
  }

  const members = await db
    .select({
      userId: familyMembers.userId,
      role: familyMembers.role,
      createdAt: familyMembers.createdAt,
    })
    .from(familyMembers)
    .where(eq(familyMembers.familyId, params.familyId))

  const userIds = members.map((m) => m.userId)
  const users = userIds.length > 0
    ? await db
        .select({ id: user.id, name: user.name, email: user.email, image: user.image })
        .from(user)
        .where(inArray(user.id, userIds))
    : []

  const userMap = new Map(users.map((u) => [u.id, u]))

  const invites = await db
    .select()
    .from(familyInvites)
    .where(eq(familyInvites.familyId, params.familyId))

  return {
    family: { id: family.id, name: family.name, ownerUserId: family.ownerUserId },
    members: members.map((m) => ({
      ...m,
      name: userMap.get(m.userId)?.name ?? "",
      email: userMap.get(m.userId)?.email ?? "",
      image: userMap.get(m.userId)?.image ?? null,
    })),
    invites,
    currentRole: member.role,
  }
}

export async function getFamilyMember(params: {
  familyId: string
  userId: string
}) {
  return db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, params.familyId), eq(familyMembers.userId, params.userId)),
  })
}

export async function getMyFamilies(params: { userId: string }) {
  const memberships = await db.query.familyMembers.findMany({
    where: eq(familyMembers.userId, params.userId),
  })

  if (memberships.length === 0) return []

  return db.select().from(families).where(inArray(families.id, memberships.map((m) => m.familyId)))
}

export async function checkIsAdmin(params: {
  familyId: string
  userId: string
}): Promise<boolean> {
  const member = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, params.familyId), eq(familyMembers.userId, params.userId)),
  })
  return member?.role === "OWNER" || member?.role === "ADMIN"
}
