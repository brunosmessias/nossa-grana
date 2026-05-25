"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Account = {
  id: string
  name: string
  type: string
  archived: boolean
}

const formSchema = z.object({
  targetAccountId: z.string().min(1, "Selecione uma conta de destino"),
  amountCents: z.number().int().positive("Informe um valor maior que zero"),
  description: z.string().max(120, "Descrição muito longa").optional().default(""),
})

type FormErrors = Partial<Record<keyof z.infer<typeof formSchema>, string>>

export function SavingsDialog({
  accounts,
  open,
  onOpenChange,
  onSubmit,
}: {
  accounts: Account[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    accountId: string
    amountCents: number
    description: string
  }) => Promise<void>
}) {
  const [targetAccountId, setTargetAccountId] = useState("")
  const [amountCents, setAmountCents] = useState(0)
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const targetAccounts = useMemo(
    () => accounts.filter((a) => !a.archived && a.type !== "CHECKING"),
    [accounts],
  )

  useEffect(() => {
    if (open) {
      setTargetAccountId("")
      setAmountCents(0)
      setDescription("")
      setErrors({})
      setSubmitting(false)
    }
  }, [open])

  const handleSubmit = async () => {
    const result = formSchema.safeParse({
      targetAccountId: targetAccountId || targetAccounts[0]?.id || "",
      amountCents,
      description,
    })

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof z.infer<typeof formSchema>
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      await onSubmit({
        accountId: result.data.targetAccountId,
        amountCents: result.data.amountCents,
        description: result.data.description,
      })

      toast.success("Dinheiro guardado com sucesso")
      onOpenChange(false)
    } catch {
      toast.error("Não foi possível guardar. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar dinheiro</DialogTitle>
          <DialogDescription>Transfira da conta corrente para outra conta</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Destino</Label>
            <Select value={targetAccountId || targetAccounts[0]?.id || ""} onValueChange={(v) => { if (v) { setTargetAccountId(v); setErrors((e) => ({ ...e, targetAccountId: undefined })) } }}>
              <SelectTrigger aria-invalid={!!errors.targetAccountId}><SelectValue placeholder="Selecionar">{(v: string | null) => v ? targetAccounts.find((a) => a.id === v)?.name ?? v : "Selecionar"}</SelectValue></SelectTrigger>
              <SelectContent>
                {targetAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.targetAccountId && <p className="text-xs text-destructive">{errors.targetAccountId}</p>}
          </div>
          <div className="space-y-2">
            <Label>Valor</Label>
            <CurrencyInput value={amountCents} onChange={(v) => { setAmountCents(v); setErrors((e) => ({ ...e, amountCents: undefined })) }} />
            {errors.amountCents && <p className="text-xs text-destructive">{errors.amountCents}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input placeholder="Ex: Guardar sobras do mês" value={description} onChange={(e) => setDescription(e.target.value)} aria-invalid={!!errors.description} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Salvando..." : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
