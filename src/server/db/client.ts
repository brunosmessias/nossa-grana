import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/env"
import * as schema from "@/server/db/schema"

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined

function getDb() {
  if (_db) return _db
  const sql = postgres(env.DATABASE_URL, { max: 10 })
  _db = drizzle(sql, { schema })
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop)
  },
})
