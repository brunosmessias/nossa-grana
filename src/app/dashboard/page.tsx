import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { getFamilyCreatedAt, getUserFamilyId } from "@/server/services/family-service"
import { formatMonthKey } from "@/lib/month-key"
import { DashboardClient } from "@/app/dashboard/ui"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const familyId = await getUserFamilyId(session.user.id)
  const familyCreatedAt = familyId ? await getFamilyCreatedAt(familyId) : null
  const familyCreatedMonth = familyCreatedAt ? formatMonthKey(familyCreatedAt) : null

  return (
    <DashboardClient
      defaultFamilyId={familyId}
      familyCreatedMonth={familyCreatedMonth}
    />
  )
}
