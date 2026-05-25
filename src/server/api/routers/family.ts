import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { env } from "@/env"
import {
  acceptInvite,
  checkIsAdmin,
  createFamily,
  getFamilyDetails,
  getFamilyMember,
  getMyFamilies,
  inviteMemberByEmail,
  removeFamilyMember,
  revokeInvite,
  updateFamilyName,
} from "@/server/services/family-service"
import {
  acceptFamilyInviteSchema,
  createFamilySchema,
  getFamilySchema,
  inviteFamilyMemberSchema,
  removeMemberSchema,
  revokeInviteSchema,
  updateFamilySchema,
} from "@/shared/schemas/family"

export const familyRouter = createTRPCRouter({
  create: protectedProcedure.input(createFamilySchema).mutation(async ({ ctx, input }) => {
    return createFamily({ userId: ctx.user.id, familyName: input.name })
  }),

  getMe: protectedProcedure.input(getFamilySchema).query(async ({ ctx, input }) => {
    return getFamilyMember({ familyId: input.familyId, userId: ctx.user.id })
  }),

  getDetails: protectedProcedure.input(getFamilySchema).query(async ({ ctx, input }) => {
    return getFamilyDetails({ familyId: input.familyId, userId: ctx.user.id })
  }),

  update: protectedProcedure.input(updateFamilySchema).mutation(async ({ ctx, input }) => {
    return updateFamilyName({ familyId: input.familyId, userId: ctx.user.id, name: input.name })
  }),

  invite: protectedProcedure.input(inviteFamilyMemberSchema).mutation(async ({ ctx, input }) => {
    const isAdmin = await checkIsAdmin({ familyId: input.familyId, userId: ctx.user.id })
    if (!isAdmin) {
      throw new Error("Only owner/admin can invite members")
    }

    return inviteMemberByEmail({
      familyId: input.familyId,
      invitedByUserId: ctx.user.id,
      invitedByName: ctx.user.name ?? ctx.user.email,
      email: input.email,
      appUrl: env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    })
  }),

  revokeInvite: protectedProcedure.input(revokeInviteSchema).mutation(async ({ ctx, input }) => {
    return revokeInvite({
      familyId: input.familyId,
      actorUserId: ctx.user.id,
      inviteId: input.inviteId,
    })
  }),

  acceptInvite: protectedProcedure.input(acceptFamilyInviteSchema).mutation(async ({ ctx, input }) => {
    return acceptInvite({
      token: input.token,
      userId: ctx.user.id,
      userEmail: ctx.user.email,
    })
  }),

  removeMember: protectedProcedure.input(removeMemberSchema).mutation(async ({ ctx, input }) => {
    return removeFamilyMember({
      familyId: input.familyId,
      actorUserId: ctx.user.id,
      targetUserId: input.userId,
    })
  }),

  getMyFamilies: protectedProcedure.query(async ({ ctx }) => {
    return getMyFamilies({ userId: ctx.user.id })
  }),
})
