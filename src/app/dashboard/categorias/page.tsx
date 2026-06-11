import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { getFamilyCreatedAt, getUserFamilyId } from "@/server/services/family-service"
import { formatMonthKey } from "@/lib/month-key"
import { CategoriesPageClient } from "./ui"

export default async function CategoriasPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  const familyId = await getUserFamilyId(session.user.id)
  if (!familyId) redirect("/onboarding")
  const familyCreatedAt = await getFamilyCreatedAt(familyId)
  const familyCreatedMonth = familyCreatedAt ? formatMonthKey(familyCreatedAt) : null
  return <CategoriesPageClient familyId={familyId} familyCreatedMonth={familyCreatedMonth} />
}
