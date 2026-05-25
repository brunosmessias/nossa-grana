import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "@/server/db/schema"

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined

function getDb() {
  if (_db) return _db
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL is required")
  const sql = postgres(connectionString, { max: 10 })
  _db = drizzle(sql, { schema })
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop)
  },
})
