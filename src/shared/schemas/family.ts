import { z } from "zod"

export const createFamilySchema = z.object({
  name: z.string().min(2).max(80),
})

export const inviteFamilyMemberSchema = z.object({
  familyId: z.string().uuid(),
  email: z.string().email(),
})

export const acceptFamilyInviteSchema = z.object({
  token: z.string().min(16),
})

export const getFamilySchema = z.object({ familyId: z.string().uuid() })

export const updateFamilySchema = z.object({
  familyId: z.string().uuid(),
  name: z.string().min(2).max(80),
})

export const revokeInviteSchema = z.object({
  familyId: z.string().uuid(),
  inviteId: z.string().uuid(),
})

export const removeMemberSchema = z.object({
  familyId: z.string().uuid(),
  userId: z.string().uuid(),
})

export type CreateFamilyInput = z.infer<typeof createFamilySchema>
export type InviteFamilyMemberInput = z.infer<typeof inviteFamilyMemberSchema>
export type AcceptFamilyInviteInput = z.infer<typeof acceptFamilyInviteSchema>
