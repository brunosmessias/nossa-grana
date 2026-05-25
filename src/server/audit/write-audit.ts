import { auditLogs } from "@/server/db/schema"
import { db } from "@/server/db/client"

import type { AuditRecord } from "@/server/audit/types"

export async function writeAuditLog(record: AuditRecord): Promise<void> {
  await db.insert(auditLogs).values({
    event: record.event,
    actorId: record.actorId,
    entity: record.entity,
    entityId: record.entityId,
    reason: record.reason,
    before: record.before ? JSON.stringify(record.before) : null,
    after: record.after ? JSON.stringify(record.after) : null,
    source: record.source,
    requestId: record.requestId,
    createdAt: new Date(record.createdAt),
  })
}
