import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { db } from "@/server/db/client"
import { familyMembers } from "@/server/db/schema"
import { inviteMemberByEmail } from "@/server/services/family-service"
import { inviteFamilyMemberSchema } from "@/shared/schemas/family"

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const input = inviteFamilyMemberSchema.parse(body)

    const member = await db.query.familyMembers.findFirst({
      where: and(eq(familyMembers.familyId, input.familyId), eq(familyMembers.userId, session.user.id)),
    })

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const result = await inviteMemberByEmail({
      familyId: input.familyId,
      invitedByUserId: session.user.id,
      invitedByName: session.user.name ?? session.user.email,
      email: input.email,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
