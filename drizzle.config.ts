import type { Config } from "drizzle-kit"

import { env } from "@/src/src/env"

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["ryb-ads__*"],
} satisfies Config
