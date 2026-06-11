import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { getUserFamilyId } from "@/server/services/family-service"
import { DashboardLayout } from "./dashboard-layout"

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const membership = await getUserFamilyId(session.user.id)

  if (!membership) {
    redirect("/onboarding")
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
