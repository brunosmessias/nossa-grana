import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/src/server/api/trpc"
import { families, familyMembers } from "@/src/server/db/schema"
import { and, eq, notInArray, sql } from "drizzle-orm"

const familyData = z.object({
  id: z.string().optional(),
  name: z.string(),
  members: z.array(
    z.object({
      name: z.string(),
      email: z.string().email(),
      clerkUserId: z.string().nullish(),
      familyId: z.string().nullish(),
      joinedAt: z.date().optional(),
    })
  ),
})
export type FamilyType = z.infer<typeof familyData>

export const familyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(familyData)
    .mutation(async ({ ctx, input }) => {
      const insertedIds = await ctx.db
        .insert(families)
        .values({ id: input.id, name: input.name })
        .onConflictDoUpdate({
          target: families.id,
          set: { name: input.name },
        })
        .returning({ insertedId: families.id })

      const familyId = insertedIds[0].insertedId
      input.members[0].clerkUserId = ctx.session.userId

      const currentMembers = await ctx.db
        .select({ email: familyMembers.email })
        .from(familyMembers)
        .where(eq(familyMembers.familyId, familyId))

      //Remove orfãos
      const currentEmails = currentMembers.map((m) => m.email)
      const inputEmails = input.members.map((m) => m.email)

      const emailsToRemove = currentEmails.filter(
        (email) => !inputEmails.includes(email)
      )
      if (emailsToRemove.length > 0) {
        await ctx.db
          .delete(familyMembers)
          .where(
            and(
              eq(familyMembers.familyId, familyId),
              notInArray(familyMembers.email, inputEmails)
            )
          )
      }

      await ctx.db
        .insert(familyMembers)
        .values(input.members.map((member) => ({ ...member, familyId })))
        .onConflictDoUpdate({
          target: familyMembers.email,
          set: { name: sql`excluded.name` },
        })

      return { familyId }
    }),

  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const member = await ctx.db.query.familyMembers.findFirst({
      where: (fm, { eq }) => eq(fm.clerkUserId, ctx.session.userId),
      with: {
        family: {
          with: {
            members: true, // pega todos os membros da família
          },
        },
      },
    })

    return member?.family ?? undefined
  }),
})
