import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { getUserFamilyId } from "@/server/services/family-service"
import { transferBetweenAccounts } from "@/server/services/mvp-service"
import { z } from "zod"

const schema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  description: z.string().max(120).optional().default(""),
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

    const result = await transferBetweenAccounts({
      userId: session.user.id,
      familyId,
      fromAccountId: input.fromAccountId,
      toAccountId: input.toAccountId,
      amountCents: input.amountCents,
      description: input.description,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
