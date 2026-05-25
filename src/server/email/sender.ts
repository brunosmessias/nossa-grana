import { resend } from "@/server/email/resend"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const fromAddress = process.env.RESEND_FROM_EMAIL
  if (!fromAddress) {
    throw new Error("RESEND_FROM_EMAIL is required")
  }

  const result = await resend.emails.send({
    from: fromAddress,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
  })

  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`)
  }
}
