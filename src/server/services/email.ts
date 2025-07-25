import { getCloudflareContext } from "@opennextjs/cloudflare"
import { Resend } from "resend"

type SendEmailParams = {
  to: string
  subject: string
  html: string
}
const resend = new Resend(process.env.RESEND_API_KEY as string)
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const res = await resend.emails.send({
    from: `"Nossa Grana" <noreply@transacional.nossagrana.com.br>`,
    to,
    subject,
    html,
  })
}

export async function renderEmailTemplate(
  templateName: string,
  variables: Record<string, string | number>
) {
  const template = await getCloudflareContext().env.emails.get(templateName)
  return (
    template?.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      const value = variables[key]
      return value !== undefined ? String(value) : ""
    }) ?? ""
  )
}
