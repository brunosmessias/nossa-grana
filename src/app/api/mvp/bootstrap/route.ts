import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { listMvpData } from "@/server/services/mvp-service"

export async function GET(request: Request) {
  try {
    const session = await getRequiredSession()
    const url = new URL(request.url)
    const familyId = url.searchParams.get("familyId")

    if (!familyId) {
      return NextResponse.json({ message: "familyId is required" }, { status: 400 })
    }

    const result = await listMvpData(session.user.id, familyId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
