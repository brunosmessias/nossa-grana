import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { getFamilyCreatedAt, getUserFamilyId } from "@/server/services/family-service"
import { getOldestTransactionAt } from "@/server/services/transaction-service"
import { earlierMonthKey, formatMonthKey } from "@/lib/month-key"
import { CategoriesPageClient } from "./ui"

export default async function CategoriasPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  const familyId = await getUserFamilyId(session.user.id)
  if (!familyId) redirect("/onboarding")
  const familyCreatedAt = await getFamilyCreatedAt(familyId)
  const familyCreatedMonth = familyCreatedAt ? formatMonthKey(familyCreatedAt) : null
  const oldestTxAt = await getOldestTransactionAt(session.user.id, familyId)
  const oldestTxMonth = oldestTxAt ? formatMonthKey(oldestTxAt) : null
  const navMinMonth =
    familyCreatedMonth && oldestTxMonth
      ? earlierMonthKey(familyCreatedMonth, oldestTxMonth)
      : familyCreatedMonth ?? oldestTxMonth
  return (
    <CategoriesPageClient
      familyId={familyId}
      familyCreatedMonth={familyCreatedMonth}
      navMinMonth={navMinMonth}
    />
  )
}
