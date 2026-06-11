import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"

import { auth } from "@/server/auth/auth"
import { getUserFamilyId } from "@/server/services/family-service"

type FamilyContext = {
  familyId: string
  role: "OWNER" | "ADMIN" | "MEMBER"
}

export async function createTRPCContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({
    headers: opts.headers,
  })

  let family: FamilyContext | null = null
  if (session?.user) {
    const membership = await getUserFamilyId(session.user.id)
    if (membership) {
      family = { familyId: membership.familyId, role: membership.role }
    }
  }

  return {
    session,
    family,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  if (!ctx.family) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Usuário sem família" })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
      family: ctx.family,
    },
  })
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
