"use client"

import { useEffect, useState } from "react"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, Pencil, Trash2, Copy, Shield, ShieldCheck, UserCircle } from "lucide-react"

type FamilyDetails = {
  family: { id: string; name: string; ownerUserId: string }
  members: Array<{
    userId: string
    role: "OWNER" | "ADMIN" | "MEMBER"
    name: string
    email: string
    image: string | null
    createdAt: Date
  }>
  invites: Array<{
    id: string
    email: string
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED"
    expiresAt: Date
    createdAt: Date
    token: string
  }>
  currentRole: "OWNER" | "ADMIN" | "MEMBER"
}

const roleLabels: Record<string, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MEMBER: "Membro",
}

const roleColors: Record<string, string> = {
  OWNER: "bg-primary/10 text-primary",
  ADMIN: "bg-blue-500/10 text-blue-500",
  MEMBER: "bg-muted text-muted-foreground",
}

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
})

export function FamilyPageClient({ familyId }: { familyId: string }) {
  const [data, setData] = useState<FamilyDetails | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [familyName, setFamilyName] = useState("")
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = data?.currentRole === "OWNER" || data?.currentRole === "ADMIN"
  const isOwner = data?.currentRole === "OWNER"

  const refresh = async () => {
    const res = await fetch("/api/family/manage")
    if (res.ok) {
      const json = await res.json()
      setData(json)
      if (json.family) setFamilyName(json.family.name)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const handleInvite = async () => {
    const result = inviteSchema.safeParse({ email: inviteEmail })
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Email inválido")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/family/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId, email: inviteEmail }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.message ?? "Erro ao enviar convite")
      }

      toast.success(`Convite enviado para ${inviteEmail}`)
      setInviteEmail("")
      setInviteOpen(false)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar convite")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditName = async () => {
    if (!familyName.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/family/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: familyName }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.message ?? "Erro ao atualizar família")
      }

      toast.success("Nome da família atualizado")
      setEditNameOpen(false)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar família")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/family/members/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.message ?? "Erro ao remover membro")
      }

      toast.success("Membro removido")
      setRemoveConfirm(null)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover membro")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const res = await fetch("/api/family/invite/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.message ?? "Erro ao revogar convite")
      }

      toast.success("Convite revogado")
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao revogar convite")
    }
  }

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/family/invite/${token}`
    navigator.clipboard.writeText(url)
    toast.success("Link copiado!")
  }

  if (!data) {
    return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Carregando...</p></div>
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold text-primary sm:text-3xl">{data.family.name}</h2>
          <p className="text-sm text-muted-foreground">
            {data.members.length} membro{data.members.length !== 1 ? "s" : ""} · {data.invites.filter((i) => i.status === "PENDING").length} convite{data.invites.filter((i) => i.status === "PENDING").length !== 1 ? "s" : ""} pendente{data.invites.filter((i) => i.status === "PENDING").length !== 1 ? "s" : ""}
          </p>
        </div>
        {isOwner && (
          <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm"><Pencil className="mr-1 size-3" /> Editar nome</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar família</DialogTitle>
                <DialogDescription>Altere o nome da família</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditNameOpen(false)}>Cancelar</Button>
                <Button onClick={handleEditName} disabled={submitting}>{submitting ? "Salvando..." : "Salvar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Membros</h3>
          {isAdmin && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger render={<Button size="sm"><Mail className="mr-1 size-3" /> Convidar membro</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar membro</DialogTitle>
                  <DialogDescription>Envie um convite por email</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@exemplo.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                  <Button onClick={handleInvite} disabled={submitting}>{submitting ? "Enviando..." : "Enviar convite"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-3">
          {data.members.map((member) => (
            <Card key={member.userId} className="border-border/50">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {member.name?.charAt(0)?.toUpperCase() ?? <UserCircle className="size-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{member.name || member.email}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-13">
                  <Badge variant="outline" className={roleColors[member.role]}>
                    {member.role === "OWNER" && <Shield className="mr-1 size-3" />}
                    {member.role === "ADMIN" && <ShieldCheck className="mr-1 size-3" />}
                    {roleLabels[member.role]}
                  </Badge>
                  {isAdmin && member.role !== "OWNER" && data.members.length > 1 && (
                    <Dialog open={removeConfirm === member.userId} onOpenChange={(open) => setRemoveConfirm(open ? member.userId : null)}>
                      <DialogTrigger render={<Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive"><Trash2 className="size-4" /></Button>} />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remover membro</DialogTitle>
                          <DialogDescription>Remover {member.name || member.email} da família? Essa pessoa perderá acesso aos dados financeiros.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setRemoveConfirm(null)}>Cancelar</Button>
                          <Button variant="destructive" onClick={() => handleRemoveMember(member.userId)} disabled={submitting}>Remover</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {data.invites.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Convites</h3>
          <div className="grid gap-3">
            {data.invites.map((invite) => {
              const isExpired = new Date(invite.expiresAt) < new Date()
              const statusLabel = invite.status === "PENDING" && isExpired ? "Expirado" : invite.status === "PENDING" ? "Pendente" : invite.status === "ACCEPTED" ? "Aceito" : invite.status === "DECLINED" ? "Recusado" : "Expirado"
              const statusColor = invite.status === "ACCEPTED" ? "text-green-500" : invite.status === "PENDING" && !isExpired ? "text-yellow-500" : "text-muted-foreground"

              return (
                <Card key={invite.id} className="border-border/50">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Mail className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{invite.email}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Enviado em {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(invite.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-7">
                      <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                      {invite.status === "PENDING" && !isExpired && (
                        <>
                          <Button variant="ghost" size="icon-xs" onClick={() => copyInviteLink(invite.token)} title="Copiar link">
                            <Copy className="size-3" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" onClick={() => handleRevokeInvite(invite.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
