import { and, eq } from "drizzle-orm"

import { db } from "@/server/db/client"
import { familyMembers } from "@/server/db/schema"

export async function assertFamilyMember(familyId: string, userId: string) {
  const member = await db.query.familyMembers.findFirst({
    where: and(eq(familyMembers.familyId, familyId), eq(familyMembers.userId, userId)),
  })

  if (!member) {
    throw new Error("Forbidden")
  }

  return member
}
