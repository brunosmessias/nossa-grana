import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { relations, sql } from "drizzle-orm"

// FAMÍLIA
export const families = sqliteTable("families", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const familiesRelations = relations(families, ({ many }) => ({
  members: many(familyMembers),
  transactions: many(transactions),
  categories: many(categories),
}))

export const familyMembers = sqliteTable(
  "family_members",
  {
    email: text("email").primaryKey(),
    name: text("name").notNull(),
    clerkUserId: text("clerk_user_id"),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    joinedAt: integer("joined_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    familyIdIdx: index("family_members_family_id_idx").on(table.familyId),
    clerkUserIdIdx: index("family_members_clerk_user_id_idx").on(
      table.clerkUserId
    ),
  })
)

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  family: one(families, {
    fields: [familyMembers.familyId],
    references: [families.id],
  }),
}))

// TRANSAÇÕES
export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    createdBy: text("create_by")
      .notNull()
      .references(() => familyMembers.email, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    type: text("type", { enum: ["INCOME", "EXPENSE"] }).notNull(),
    transactionDate: integer("transaction_date", {
      mode: "timestamp",
    }).notNull(),
    isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
  },
  (table) => ({
    familyIdIdx: index("transactions_family_id_idx").on(table.familyId),
    transactionDateIdx: index("transactions_date_idx").on(
      table.transactionDate
    ),
  })
)

export const transactionsRelations = relations(transactions, ({ one }) => ({
  family: one(families, {
    fields: [transactions.familyId],
    references: [families.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  createdByMember: one(familyMembers, {
    fields: [transactions.createdBy],
    references: [familyMembers.email],
  }),
}))

// CATEGORIAS
export const categories = sqliteTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"), // HEX color
    icon: text("icon"),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    familyIdx: index("categories_family_idx").on(table.familyId),
    typeIdx: index("categories_type_idx").on(table.type),
  })
)

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  family: one(families, {
    fields: [categories.familyId],
    references: [families.id],
  }),
  transactions: many(transactions),
}))
