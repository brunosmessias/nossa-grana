"use client";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
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
import { createCategorySchema } from "@/shared/schemas/category";
import { Tag } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

type CategoryKind = "INCOME" | "EXPENSE";

const categoryKindLabels: Record<CategoryKind, string> = {
  EXPENSE: "Despesa",
  INCOME: "Receita",
};

const clientSchema = createCategorySchema.pick({ name: true });

type FormErrors = Partial<Record<"name", string>>;

export function CategoryDialog({
  onSubmit,
}: {
  onSubmit: (data: {
    name: string;
    kind: CategoryKind;
    icon: string;
    color: string;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryKind, setCategoryKind] = useState<CategoryKind>("EXPENSE");
  const [categoryIcon, setCategoryIcon] = useState("tag");
  const [categoryColor, setCategoryColor] = useState("#1866e4");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const result = clientSchema.safeParse({ name: categoryName });

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
        kind: categoryKind,
        icon: categoryIcon,
        color: categoryColor,
      });

      toast.success("Categoria criada com sucesso");
      setCategoryName("");
      setCategoryIcon("tag");
      setCategoryColor("#1866e4");
      setOpen(false);
    } catch {
      toast.error("Não foi possível criar a categoria. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Tag className="mr-1 size-3" /> Nova categoria
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>
            Organize suas transações por categoria
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Alimentação"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
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
            <Select
              value={categoryKind}
              onValueChange={(v) => {
                if (v) setCategoryKind(v as CategoryKind);
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: string | null) =>
                    v
                      ? (categoryKindLabels[v as CategoryKind] ?? v)
                      : "Selecionar"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
                <SelectItem value="INCOME">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ícone</Label>
            <IconPicker
              value={categoryIcon}
              color={categoryColor}
              onChange={setCategoryIcon}
            />
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <ColorPicker value={categoryColor} onChange={setCategoryColor} />
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
