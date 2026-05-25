import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { acceptInvite } from "@/server/services/family-service"
import { acceptFamilyInviteSchema } from "@/shared/schemas/family"

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const input = acceptFamilyInviteSchema.parse(body)

    const result = await acceptInvite({
      token: input.token,
      userId: session.user.id,
      userEmail: session.user.email,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
