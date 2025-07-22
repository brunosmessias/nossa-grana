import { drizzle } from "drizzle-orm/d1"

import * as schema from "./schema"
import { getCloudflareContext } from "@opennextjs/cloudflare"


export function getDB() {
  return drizzle(getCloudflareContext().env.DB, { schema })
}
