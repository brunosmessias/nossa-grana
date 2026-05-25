"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { createTransactionSchema } from "@/shared/schemas/transaction"
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
import { IconBadge } from "@/components/ui/icon-badge"
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

type Category = {
  id: string
  name: string
  kind: "INCOME" | "EXPENSE"
  icon: string
  color: string
}

const titleByType: Record<"INCOME" | "EXPENSE", string> = {
  EXPENSE: "Nova despesa",
  INCOME: "Nova receita",
}

const clientSchema = createTransactionSchema.pick({
  categoryId: true,
  amountCents: true,
  description: true,
}).extend({
  date: z.string().min(1, "Informe uma data"),
})

type FormErrors = Partial<Record<keyof z.infer<typeof clientSchema>, string>>

export function TransactionDialog({
  accounts,
  categories,
  defaultType,
  open,
  onOpenChange,
  onSubmit,
}: {
  accounts: Account[]
  categories: Category[]
  defaultType: "INCOME" | "EXPENSE"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    accountId: string
    categoryId: string
    type: "INCOME" | "EXPENSE"
    description: string
    amountCents: number
    transactionAt: string
  }) => Promise<void>
}) {
  const [txCategoryId, setTxCategoryId] = useState("")
  const [txAmountCents, setTxAmountCents] = useState(0)
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split("T")[0])
  const [txDescription, setTxDescription] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const defaultAccountId = useMemo(() => {
    const checking = accounts.find((a) => a.type === "CHECKING" && !a.archived)
    return checking?.id ?? accounts.find((a) => !a.archived)?.id ?? ""
  }, [accounts])

  const categoriesByType = categories.filter((c) => c.kind === defaultType)

  useEffect(() => {
    if (open) {
      setTxCategoryId("")
      setTxAmountCents(0)
      setTxDate(new Date().toISOString().split("T")[0])
      setTxDescription("")
      setErrors({})
      setSubmitting(false)
    }
  }, [open])

  const handleSubmit = async () => {
    const result = clientSchema.safeParse({
      categoryId: txCategoryId || categoriesByType[0]?.id || "",
      amountCents: txAmountCents,
      date: txDate,
      description: txDescription,
    })

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof z.infer<typeof clientSchema>
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      const [year, month, day] = txDate.split("-").map(Number)
      const date = new Date(year, month - 1, day, 12, 0, 0)

      await onSubmit({
        accountId: defaultAccountId,
        categoryId: result.data.categoryId,
        type: defaultType,
        description: result.data.description,
        amountCents: result.data.amountCents,
        transactionAt: date.toISOString(),
      })

      toast.success(defaultType === "EXPENSE" ? "Despesa registrada" : "Receita registrada")
      onOpenChange(false)
    } catch {
      toast.error("Não foi possível salvar. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titleByType[defaultType]}</DialogTitle>
          <DialogDescription>
            {defaultType === "EXPENSE" ? "Registre uma nova despesa" : "Registre uma nova receita"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={txCategoryId || categoriesByType[0]?.id || ""} onValueChange={(v) => { if (v) { setTxCategoryId(v); setErrors((e) => ({ ...e, categoryId: undefined })) } }}>
              <SelectTrigger aria-invalid={!!errors.categoryId}><SelectValue placeholder="Selecionar">{(v: string | null) => v ? categoriesByType.find((c) => c.id === v)?.name ?? v : "Selecionar"}</SelectValue></SelectTrigger>
              <SelectContent>
                {categoriesByType.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <IconBadge icon={category.icon} color={category.color} size="sm" />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor</Label>
              <CurrencyInput value={txAmountCents} onChange={(v) => { setTxAmountCents(v); setErrors((e) => ({ ...e, amountCents: undefined })) }} />
              {errors.amountCents && <p className="text-xs text-destructive">{errors.amountCents}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={txDate} onChange={(e) => { setTxDate(e.target.value); setErrors((e2) => ({ ...e2, date: undefined })) }} aria-invalid={!!errors.date} />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input placeholder="Ex: Supermercado" value={txDescription} onChange={(e) => { setTxDescription(e.target.value); setErrors((e) => ({ ...e, description: undefined })) }} aria-invalid={!!errors.description} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Salvando..." : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
