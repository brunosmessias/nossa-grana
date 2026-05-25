import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { db } from "@/server/db/client"
import { families, familyMembers } from "@/server/db/schema"

export async function GET() {
  try {
    const session = await getRequiredSession()

    const membership = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.userId, session.user.id),
    })

    if (!membership) {
      return NextResponse.json(null)
    }

    const family = await db.query.families.findFirst({
      where: eq(families.id, membership.familyId),
    })

    return NextResponse.json(family)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 401 })
  }
}
