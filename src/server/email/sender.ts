import { resend } from "@/server/email/resend"
import { env } from "@/env"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const result = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
  })

  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`)
  }
}
