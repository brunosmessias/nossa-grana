import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { getUserFamilyId } from "@/server/services/family-service"
import { FamilyPageClient } from "./ui"

export default async function FamiliaPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const familyId = await getUserFamilyId(session.user.id)

  if (!familyId) {
    redirect("/onboarding")
  }

  return <FamilyPageClient familyId={familyId} />
}
