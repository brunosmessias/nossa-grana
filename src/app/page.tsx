import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth/auth"
import { LandingPage } from "./landing-ui"

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
