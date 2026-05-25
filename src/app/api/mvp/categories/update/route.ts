import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { getUserFamilyId } from "@/server/services/family-service"
import { updateCategory } from "@/server/services/mvp-service"
import { z } from "zod"

const schema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  monthlyBudgetCents: z.number().int().positive().nullable().optional(),
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

    const result = await updateCategory(session.user.id, familyId, input.categoryId, input)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
