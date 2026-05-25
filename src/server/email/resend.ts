import { Resend } from "resend"

let _resend: Resend | undefined

function getResend() {
  if (_resend) return _resend
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is required")
  _resend = new Resend(apiKey)
  return _resend
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return Reflect.get(getResend(), prop)
  },
})
