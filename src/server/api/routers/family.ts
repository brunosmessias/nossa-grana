import { eq, and, inArray } from "drizzle-orm"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { db } from "@/server/db/client"
import { families, familyMembers } from "@/server/db/schema"
import { acceptInvite, createFamily, inviteMemberByEmail } from "@/server/services/family-service"
import { acceptFamilyInviteSchema, createFamilySchema, inviteFamilyMemberSchema } from "@/shared/schemas/family"

export const familyRouter = createTRPCRouter({
  create: protectedProcedure.input(createFamilySchema).mutation(async ({ ctx, input }) => {
    return createFamily({
      userId: ctx.user.id,
      familyName: input.name,
    })
  }),

  invite: protectedProcedure.input(inviteFamilyMemberSchema).mutation(async ({ ctx, input }) => {
    const member = await db.query.familyMembers.findFirst({
      where: and(
        eq(familyMembers.familyId, input.familyId),
        eq(familyMembers.userId, ctx.user.id),
      ),
    })

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new Error("Only owner/admin can invite members")
    }

    return inviteMemberByEmail({
      familyId: input.familyId,
      invitedByUserId: ctx.user.id,
      invitedByName: ctx.user.name ?? ctx.user.email,
      email: input.email,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    })
  }),

  acceptInvite: protectedProcedure
    .input(acceptFamilyInviteSchema)
    .mutation(async ({ ctx, input }) => {
      return acceptInvite({
        token: input.token,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
      })
    }),

  getMyFamilies: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await db.query.familyMembers.findMany({
      where: eq(familyMembers.userId, ctx.user.id),
    })

    if (memberships.length === 0) {
      return []
    }

    const familyIds = memberships.map((item) => item.familyId)

    return db.select().from(families).where(inArray(families.id, familyIds))
  }),
})
