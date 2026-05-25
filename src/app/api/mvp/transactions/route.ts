import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { createTransaction } from "@/server/services/mvp-service"
import { createTransactionSchema } from "@/shared/schemas/transaction"

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const input = createTransactionSchema.parse(body)

    const result = await createTransaction(session.user.id, input)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
