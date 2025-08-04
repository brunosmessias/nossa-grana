import { api, HydrateClient } from "@/src/trpc/server"
import ClientPageCategories from "@/src/app/_components/page/categories/pageCategories"

export default async function Page() {
  await api.category.getAllWithStats.prefetch()

  return (
    <HydrateClient>
      <ClientPageCategories />
    </HydrateClient>
  )
}
