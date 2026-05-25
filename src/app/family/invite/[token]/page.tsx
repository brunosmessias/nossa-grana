import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"

import { AcceptInviteClient } from "./ui"

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect(`/sign-in?next=/family/invite/${token}`)
  }

  return <AcceptInviteClient token={token} />
}
