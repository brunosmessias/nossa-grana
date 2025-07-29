import { eq } from "drizzle-orm"
import { categories } from "@/src/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/src/server/api/trpc"

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(categories)
      .where(
        eq(categories.familyId, ctx.session.sessionClaims.metadata!.familyId!)
      )
  }),
})
