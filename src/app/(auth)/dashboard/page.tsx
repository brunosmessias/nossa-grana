import ClientPageDashboard from "@/src/app/_components/page/dashboard/pageTransactions"
import { api, HydrateClient } from "@/src/trpc/server"

export default async function Page() {
  const today = new Date()

  await api.transaction.getByMonth.prefetch({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  })

  return (
    <HydrateClient>
      <ClientPageDashboard />
    </HydrateClient>
  )
}
