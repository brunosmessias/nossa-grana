import { Resend } from "resend"

import { env } from "@/env"

let _resend: Resend | undefined

function getResend() {
  if (_resend) return _resend
  _resend = new Resend(env.RESEND_API_KEY)
  return _resend
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return Reflect.get(getResend(), prop)
  },
})
