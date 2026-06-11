import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { user, session, account, verification } from "@/server/db/auth-schema"

export { user, session, account, verification }

export const familyRoleEnum = pgEnum("family_role", ["OWNER", "ADMIN", "MEMBER"])
export const inviteStatusEnum = pgEnum("invite_status", ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"])
export const accountTypeEnum = pgEnum("account_type", [
  "CHECKING",
  "SAVINGS",
  "CASH",
  "INVESTMENT",
  "CREDIT_CARD",
  "LOAN",
  "GOAL",
])
export const categoryKindEnum = pgEnum("category_kind", ["INCOME", "EXPENSE"])
export const transactionTypeEnum = pgEnum("transaction_type", ["INCOME", "EXPENSE"])

export const families = pgTable("families", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const familyMembers = pgTable(
  "family_members",
  {
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: familyRoleEnum("role").notNull().default("MEMBER"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.familyId, table.userId] }),
  }),
)

export const familyInvites = pgTable(
  "family_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    invitedByUserId: text("invited_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    token: text("token").notNull(),
    status: inviteStatusEnum("status").notNull().default("PENDING"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("family_invites_token_idx").on(table.token),
  }),
)

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  icon: text("icon").notNull().default("wallet"),
  color: text("color").notNull().default("#1866e4"),
  initialBalanceCents: integer("initial_balance_cents").notNull().default(0),
  targetAmountCents: integer("target_amount_cents"),
  targetDate: timestamp("target_date", { withTimezone: true }),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: categoryKindEnum("kind").notNull(),
  icon: text("icon").notNull().default("tag"),
  color: text("color").notNull().default("#1866e4"),
  monthlyBudgetCents: integer("monthly_budget_cents"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    type: transactionTypeEnum("type").notNull(),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    transactionAt: timestamp("transaction_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    familyTransactionAtIdx: index("transactions_family_id_transaction_at_idx").on(
      table.familyId,
      table.transactionAt,
    ),
  }),
)

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  event: text("event").notNull(),
  actorId: text("actor_id").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  reason: text("reason").notNull(),
  before: text("before"),
  after: text("after"),
  source: text("source").notNull(),
  requestId: text("request_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  familiesOwned: many(families),
  familyMemberships: many(familyMembers),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountAuthRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const familiesRelations = relations(families, ({ one, many }) => ({
  owner: one(user, {
    fields: [families.ownerUserId],
    references: [user.id],
    relationName: "familiesOwner",
  }),
  members: many(familyMembers),
  invites: many(familyInvites),
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
}))

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  family: one(families, {
    fields: [familyMembers.familyId],
    references: [families.id],
  }),
  member: one(user, {
    fields: [familyMembers.userId],
    references: [user.id],
    relationName: "familyMemberUser",
  }),
}))

export const familyInvitesRelations = relations(familyInvites, ({ one }) => ({
  family: one(families, {
    fields: [familyInvites.familyId],
    references: [families.id],
  }),
  invitedBy: one(user, {
    fields: [familyInvites.invitedByUserId],
    references: [user.id],
    relationName: "inviteInvitedBy",
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  family: one(families, {
    fields: [accounts.familyId],
    references: [families.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ one }) => ({
  family: one(families, {
    fields: [categories.familyId],
    references: [families.id],
  }),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  family: one(families, {
    fields: [transactions.familyId],
    references: [families.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}))
