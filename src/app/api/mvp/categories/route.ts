import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { createCategory } from "@/server/services/mvp-service"
import { createCategorySchema } from "@/shared/schemas/category"

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()
    const input = createCategorySchema.parse(body)

    const result = await createCategory(session.user.id, input)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
