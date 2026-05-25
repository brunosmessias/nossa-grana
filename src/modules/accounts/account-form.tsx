"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "@tanstack/react-form"
import { upsertAccountSchema } from "@/shared/schemas/account"

export function AccountFormModal() {
  const form = useForm({
    defaultValues: {
      familyId: "",
      name: "",
      type: "CHECKING" as "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT" | "CREDIT_CARD" | "LOAN" | "GOAL",
      initialBalanceCents: 0,
      archived: false
    },
    validators: {
      onSubmit: upsertAccountSchema as any
    },
    onSubmit: async () => undefined
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <p>Formulário-base com TanStack Form + Zod compartilhado.</p>
      <button type="submit">Salvar</button>
    </form>
  )
}
