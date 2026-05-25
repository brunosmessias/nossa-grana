import type { AuditEventName } from "@/server/audit/events"

type JsonRecord = Record<string, unknown>

export type AuditRecord = {
  event: AuditEventName
  actorId: string
  entity: string
  entityId: string
  reason: string
  before: JsonRecord | null
  after: JsonRecord | null
  source: "web" | "api" | "worker"
  requestId: string
  createdAt: string
}
