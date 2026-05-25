import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { getFamilyDetails, updateFamilyName } from "@/server/services/family-service"
import { getUserFamilyId } from "@/server/services/family-service"

export async function GET() {
  try {
    const session = await getRequiredSession()
    const familyId = await getUserFamilyId(session.user.id)

    if (!familyId) {
      return NextResponse.json(null)
    }

    const details = await getFamilyDetails({ familyId, userId: session.user.id })
    return NextResponse.json(details)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const familyId = await getUserFamilyId(session.user.id)

    if (!familyId) {
      return NextResponse.json({ message: "Família não encontrada" }, { status: 404 })
    }

    if (body.name) {
      await updateFamilyName({ familyId, userId: session.user.id, name: body.name })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
