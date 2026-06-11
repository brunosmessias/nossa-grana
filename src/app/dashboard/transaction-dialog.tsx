"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { createTransactionSchema } from "@/shared/schemas/transaction"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

type InitialTransaction = {
  id: string
  description: string
  type: "INCOME" | "EXPENSE"
  amountCents: number
  transactionAt: Date | string
  categoryId: string | null
  accountId: string
  paid: boolean
}

function toDateInputValue(value: Date | string): string {
  const iso = typeof value === "string" ? value : value.toISOString()
  return iso.split("T")[0] ?? ""
}

const titleByType: Record<"INCOME" | "EXPENSE", string> = {
  EXPENSE: "Nova despesa",
  INCOME: "Nova receita",
}

const editTitleByType: Record<"INCOME" | "EXPENSE", string> = {
  EXPENSE: "Editar despesa",
  INCOME: "Editar receita",
}

const clientSchema = createTransactionSchema.pick({
  categoryId: true,
  amountCents: true,
  description: true,
}).extend({
  date: z.string().min(1, "Informe uma data"),
  accountId: z.string().min(1, "Selecione uma conta"),
})

type FormErrors = Partial<Record<keyof z.infer<typeof clientSchema>, string>>

export function TransactionDialog({
  accounts,
  categories,
  defaultType,
  open,
  onOpenChange,
  onSubmit,
  initialTransaction = null,
  onUpdate,
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
    paid: boolean
  }) => Promise<void>
  initialTransaction?: InitialTransaction | null
  onUpdate?: (data: {
    accountId: string
    categoryId: string
    type: "INCOME" | "EXPENSE"
    description: string
    amountCents: number
    transactionAt: string
    paid: boolean
  }) => Promise<void>
}) {
  const isEdit = !!initialTransaction
  const activeType: "INCOME" | "EXPENSE" = isEdit ? initialTransaction.type : defaultType
  const [txAccountId, setTxAccountId] = useState("")
  const [txCategoryId, setTxCategoryId] = useState("")
  const [txAmountCents, setTxAmountCents] = useState(0)
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split("T")[0])
  const [txDescription, setTxDescription] = useState("")
  const [txPaid, setTxPaid] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const activeAccounts = useMemo(() => accounts.filter((a) => !a.archived), [accounts])

  const defaultAccountId = useMemo(() => {
    if (isEdit && initialTransaction?.accountId) {
      return initialTransaction.accountId
    }
    const checking = activeAccounts.find((a) => a.type === "CHECKING")
    return checking?.id ?? activeAccounts[0]?.id ?? ""
  }, [activeAccounts, isEdit, initialTransaction])

  const categoriesByType = useMemo(
    () => categories.filter((c) => c.kind === activeType),
    [categories, activeType],
  )

  useEffect(() => {
    if (open) {
      if (isEdit && initialTransaction) {
        setTxAccountId(initialTransaction.accountId)
        setTxCategoryId(initialTransaction.categoryId ?? "")
        setTxAmountCents(initialTransaction.amountCents)
        setTxDate(toDateInputValue(initialTransaction.transactionAt))
        setTxDescription(initialTransaction.description)
        setTxPaid(initialTransaction.paid)
      } else {
        setTxAccountId(defaultAccountId)
        setTxCategoryId("")
        setTxAmountCents(0)
        setTxDate(new Date().toISOString().split("T")[0])
        setTxDescription("")
        setTxPaid(true)
      }
      setErrors({})
      setSubmitting(false)
    }
  }, [open, isEdit, initialTransaction, defaultAccountId])

  const handleSubmit = async () => {
    const result = clientSchema.safeParse({
      accountId: txAccountId || defaultAccountId,
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
      const [year, month, day] = result.data.date.split("-").map(Number)
      const date = new Date(year, month - 1, day, 12, 0, 0)

      const payload = {
        accountId: result.data.accountId,
        categoryId: result.data.categoryId,
        type: activeType,
        description: result.data.description,
        amountCents: result.data.amountCents,
        transactionAt: date.toISOString(),
        paid: txPaid,
      }

      if (isEdit) {
        if (!onUpdate) {
          throw new Error("onUpdate handler não fornecido")
        }
        await onUpdate(payload)
        toast.success("Transação atualizada")
      } else {
        await onSubmit(payload)
        toast.success(activeType === "EXPENSE" ? "Despesa registrada" : "Receita registrada")
      }
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
          <DialogTitle>
            {isEdit ? editTitleByType[activeType] : titleByType[defaultType]}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Altere os dados da transação"
              : activeType === "EXPENSE"
                ? "Registre uma nova despesa"
                : "Registre uma nova receita"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isEdit && (
            <div className="space-y-2">
              <Label>Conta</Label>
              <Select
                value={txAccountId || defaultAccountId}
                onValueChange={(v) => {
                  if (v) {
                    setTxAccountId(v)
                    setErrors((e) => ({ ...e, accountId: undefined }))
                  }
                }}
              >
                <SelectTrigger aria-invalid={!!errors.accountId} className="w-full">
                  <SelectValue placeholder="Selecionar">
                    {(v: string | null) =>
                      v
                        ? activeAccounts.find((a) => a.id === v)?.name ?? v
                        : "Selecionar"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-xs text-destructive">{errors.accountId}</p>
              )}
            </div>
          )}
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
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={txPaid}
                onCheckedChange={(value) => setTxPaid(value === true)}
              />
              <span className="text-sm font-medium leading-none">Pago</span>
            </label>
            {!txPaid && (
              <p className="text-xs text-muted-foreground">
                Você poderá marcar como pago depois na tabela
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
