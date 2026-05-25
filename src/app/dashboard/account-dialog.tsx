"use client";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { upsertAccountSchema } from "@/shared/schemas/account";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CASH"
  | "INVESTMENT"
  | "CREDIT_CARD"
  | "LOAN"
  | "GOAL";

const accountTypeLabels: Record<AccountType, string> = {
  CHECKING: "Corrente",
  SAVINGS: "Poupança",
  CASH: "Carteira",
  INVESTMENT: "Investimento",
  CREDIT_CARD: "Cartão",
  LOAN: "Empréstimo",
  GOAL: "Meta",
};

const accountTypeIcons: Record<AccountType, string> = {
  CHECKING: "bank",
  SAVINGS: "piggy-bank",
  CASH: "wallet",
  INVESTMENT: "investments",
  CREDIT_CARD: "credit-card",
  LOAN: "money",
  GOAL: "savings",
};

const clientSchema = upsertAccountSchema.pick({ name: true });

type FormErrors = Partial<Record<"name", string>>;

export function AccountDialog({
  onSubmit,
}: {
  onSubmit: (data: {
    name: string;
    type: AccountType;
    initialBalanceCents: number;
    icon: string;
    color: string;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("CHECKING");
  const [accountIcon, setAccountIcon] = useState("bank");
  const [accountColor, setAccountColor] = useState("#1866e4");
  const [accountInitialCents, setAccountInitialCents] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleTypeChange = (v: string | null) => {
    if (!v) return;
    const t = v as AccountType;
    setAccountType(t);
    setAccountIcon(accountTypeIcons[t]);
  };

  const handleSubmit = async () => {
    const result = clientSchema.safeParse({ name: accountName });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof z.infer<typeof clientSchema>;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await onSubmit({
        name: result.data.name,
        type: accountType,
        initialBalanceCents: accountInitialCents,
        icon: accountIcon,
        color: accountColor,
      });

      toast.success("Conta criada com sucesso");
      setAccountName("");
      setAccountInitialCents(0);
      setAccountIcon("bank");
      setAccountColor("#1866e4");
      setOpen(false);
    } catch {
      toast.error("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Wallet className="mr-1 size-3" /> Nova conta
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova conta</DialogTitle>
          <DialogDescription>Adicione uma conta financeira</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Nubank"
              value={accountName}
              onChange={(e) => {
                setAccountName(e.target.value);
                setErrors({});
              }}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={accountType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue>
                  {(v: string | null) =>
                    v
                      ? (accountTypeLabels[v as AccountType] ?? v)
                      : "Selecionar"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKING">Corrente</SelectItem>
                <SelectItem value="SAVINGS">Poupança</SelectItem>
                <SelectItem value="CASH">Carteira</SelectItem>
                <SelectItem value="INVESTMENT">Investimento</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão</SelectItem>
                <SelectItem value="LOAN">Empréstimo</SelectItem>
                <SelectItem value="GOAL">Meta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Saldo inicial</Label>
            <CurrencyInput
              value={accountInitialCents}
              onChange={setAccountInitialCents}
            />
          </div>
          <div className="space-y-2">
            <Label>Ícone</Label>
            <IconPicker
              value={accountIcon}
              color={accountColor}
              onChange={setAccountIcon}
            />
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <ColorPicker value={accountColor} onChange={setAccountColor} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Salvando..." : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
