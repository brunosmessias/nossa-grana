import { drizzle } from "drizzle-orm/d1"

import * as schema from "./schema"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { cache } from "react"

export const getDB = cache(() => {
  const { env } = getCloudflareContext()
  return drizzle(env.DB, { schema })
})

// This is the one to use for static routes (i.e. ISR/SSG)
export const getDBAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true })
  return drizzle(env.DB, { schema })
})
