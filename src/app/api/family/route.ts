import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { createFamily } from "@/server/services/family-service"
import { createFamilySchema } from "@/shared/schemas/family"

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const input = createFamilySchema.parse(body)

    const result = await createFamily({
      userId: session.user.id,
      familyName: input.name,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
