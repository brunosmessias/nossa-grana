export const auditEvents = {
  authUserRegistered: "auth.user.registered",
  accountCreated: "account.created",
  accountUpdated: "account.updated",
  accountArchived: "account.archived",
  transactionCreated: "transaction.created",
  transactionUpdated: "transaction.updated",
  transactionDeleted: "transaction.deleted",
  familyCreated: "family.created",
  familyMemberInvited: "family.member.invited",
  familyInviteAccepted: "family.invite.accepted",
  familyUpdated: "family.updated",
  familyMemberRemoved: "family.member.removed",
  familyInviteRevoked: "family.invite.revoked",
  categoryUpdated: "category.updated",
  transactionsBatchImported: "transactions.batch_imported",
} as const

export type AuditEventName = (typeof auditEvents)[keyof typeof auditEvents]
