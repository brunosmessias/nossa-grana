import { and, eq } from "drizzle-orm"

import { db } from "@/server/db/client"
import { familyMembers } from "@/server/db/schema"

export type FamilyMembership = {
  familyId: string
  role: "OWNER" | "ADMIN" | "MEMBER"
}

export async function assertFamilyMember(
  familyId: string,
  userId: string,
  preResolved?: FamilyMembership,
): Promise<FamilyMembership> {
  if (preResolved && preResolved.familyId === familyId) {
    return preResolved
  }

  const member = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, familyId), eq(familyMembers.userId, userId)),
  })

  if (!member) {
    throw new Error("Forbidden")
  }

  return { familyId: member.familyId, role: member.role }
}
