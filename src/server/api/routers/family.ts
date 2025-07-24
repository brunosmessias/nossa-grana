import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/src/server/api/trpc"
import { families, familyMembers } from "@/src/server/db/schema"
import { and, eq, isNull, notInArray, sql } from "drizzle-orm"
import { renderEmailTemplate, sendEmail } from "@/src/server/services/email"
import { clerkClient } from "@clerk/nextjs/server"

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
          set: {
            name: sql`excluded
            .
            name`,
          },
        })

      //Se é novo usuário
      if (!input.members[0].joinedAt) {
        const client = await clerkClient()
        await client.users.updateUserMetadata(ctx.session.userId, {
          publicMetadata: {
            familyId: familyId,
          },
        })
      }

      // Envia email para convidados novos
      const html = await renderEmailTemplate("invite", {
        familyName: input.name,
        inviterName: input.members[0].name,
        inviteLink: "https://nossagrana.com.br/family",
      })

      for (const member of input.members.filter(
        (m) => !m.joinedAt && m.clerkUserId !== ctx.session.userId
      )) {
        await sendEmail({
          to: member.email,
          subject: "Você foi convidado para uma família no Nossa Grana",
          html: html,
        })
      }

      return { familyId }
    }),

  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const member = await ctx.db.query.familyMembers.findFirst({
      where: (fm, { eq }) => eq(fm.clerkUserId, ctx.session.userId),
      with: {
        family: {
          with: {
            members: true,
          },
        },
      },
    })

    return member?.family ?? undefined
  }),

  getInvitedBy: protectedProcedure.query(async ({ ctx }) => {
    const member = await ctx.db.query.familyMembers.findFirst({
      where: (fm, { eq, and }) =>
        and(
          eq(fm.email, ctx.session.sessionClaims.email),
          isNull(fm.clerkUserId)
        ),
      with: {
        family: {
          with: {
            members: true,
          },
        },
      },
    })

    return member?.family ?? undefined
  }),

  answerInvite: protectedProcedure
    .input(
      z.object({
        answer: z.boolean(),
        familyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.answer) {
        await ctx.db
          .update(familyMembers)
          .set({ clerkUserId: ctx.session.userId })
          .where(eq(familyMembers.email, ctx.session.sessionClaims.email))
        const client = await clerkClient()
        await client.users.updateUserMetadata(ctx.session.userId, {
          publicMetadata: {
            familyId: input.familyId,
          },
        })
      } else {
        await ctx.db
          .delete(familyMembers)
          .where(eq(familyMembers.email, ctx.session.sessionClaims.email))
      }

      return { ok: true }
    }),
})
