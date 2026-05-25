import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { getUserFamilyId } from "@/server/services/family-service"
import { DashboardClient } from "@/app/dashboard/ui"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const familyId = await getUserFamilyId(session.user.id)

  return (
    <DashboardClient defaultFamilyId={familyId} />
  )
}
