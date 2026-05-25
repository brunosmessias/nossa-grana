import { NextResponse } from "next/server"

import { getRequiredSession } from "@/server/auth/session"
import { deleteCategory } from "@/server/services/mvp-service"

export async function DELETE(request: Request, context: { params: Promise<{ categoryId: string }> }) {
  try {
    const session = await getRequiredSession()
    const { categoryId } = await context.params
    const url = new URL(request.url)
    const familyId = url.searchParams.get("familyId")

    if (!familyId) {
      return NextResponse.json({ message: "familyId is required" }, { status: 400 })
    }

    const result = await deleteCategory(session.user.id, familyId, categoryId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 400 })
  }
}
