import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { getUserFamilyId } from "@/server/services/family-service"
import { TransactionsPageClient } from "./ui"

export default async function TransacoesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  const membership = await getUserFamilyId(session.user.id)
  if (!membership) redirect("/onboarding")
  return <TransactionsPageClient familyId={membership.familyId} />
}
