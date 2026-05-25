import { initTRPC, TRPCError } from "@trpc/server"
import { headers } from "next/headers"
import superjson from "superjson"

import { auth } from "@/server/auth/auth"

export async function createTRPCContext() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return {
    session,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  })
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
