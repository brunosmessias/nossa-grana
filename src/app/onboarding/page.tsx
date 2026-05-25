import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { getUserFamilyId } from "@/server/services/family-service"

import { OnboardingClient } from "./ui"

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const existingFamilyId = await getUserFamilyId(session.user.id)
  if (existingFamilyId) {
    redirect("/dashboard")
  }

  return <OnboardingClient userName={session.user.name ?? session.user.email} />
}
