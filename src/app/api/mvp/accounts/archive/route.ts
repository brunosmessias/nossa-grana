import { NextResponse } from "next/server"
import { z } from "zod"

import { getRequiredSession } from "@/server/auth/session"
import { archiveAccount } from "@/server/services/mvp-service"

const schema = z.object({
  familyId: z.string().uuid(),
  accountId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const input = schema.parse(body)

    const result = await archiveAccount(session.user.id, input.familyId, input.accountId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
