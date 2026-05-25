import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { upsertAccount } from "@/server/services/mvp-service"
import { upsertAccountSchema } from "@/shared/schemas/account"

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const input = upsertAccountSchema.parse(body)

    const result = await upsertAccount(session.user.id, input)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
