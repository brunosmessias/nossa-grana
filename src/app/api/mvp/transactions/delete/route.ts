import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { getUserFamilyId } from "@/server/services/family-service"
import { deleteTransaction } from "@/server/services/mvp-service"
import { z } from "zod"

const schema = z.object({
  transactionId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const input = schema.parse(body)
    const familyId = await getUserFamilyId(session.user.id)

    if (!familyId) {
      return NextResponse.json({ message: "Família não encontrada" }, { status: 404 })
    }

    const result = await deleteTransaction(session.user.id, familyId, input.transactionId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
