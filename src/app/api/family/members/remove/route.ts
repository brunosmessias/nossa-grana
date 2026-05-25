import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { getUserFamilyId, removeFamilyMember } from "@/server/services/family-service"

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const familyId = await getUserFamilyId(session.user.id)

    if (!familyId) {
      return NextResponse.json({ message: "Família não encontrada" }, { status: 404 })
    }

    await removeFamilyMember({
      familyId,
      actorUserId: session.user.id,
      targetUserId: body.userId,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
