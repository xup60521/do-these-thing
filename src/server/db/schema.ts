import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `do-these-thing_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  todos: many(todos),
  groups: many(groups),
  rules: many(rules),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const todos = createTable("todo", {
  todoId: varchar("todoId", { length: 255 }).notNull().primaryKey(),
  todoOwner: varchar("todoOwner", { length: 255 })
    .notNull()
    .references(() => users.id),
  todoTitle: varchar("todoTitle", { length: 255 }).notNull(),
  todoDescription: varchar("todoDescription", { length: 255 }),
  groupId: varchar("groupId", { length: 255 }).default("").references(() => groups.groupId),
  todoChecked: boolean("todoChecked").notNull(),
  todoCreatedAt: timestamp("todoCreatedAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  todoEndAt: timestamp("todoEndAt", { withTimezone: true }),
  baseRule: varchar("baseRule", { length: 255 }).references(() => rules.ruleId),
});

export const todosRelations = relations(todos, ({ one }) => ({
  users: one(users, {
    fields: [todos.todoOwner],
    references: [users.id],
  }),
  groups: one(groups, {
    fields: [todos.groupId],
    references: [groups.groupId],
  }),
  rules: one(rules, {
    fields: [todos.baseRule],
    references: [rules.ruleId],
  }),
}));

type FromGroup = string
type ToGroup = string
type TargetNumber = string
type TargetTodoName = string
type TargetGroupVisibility = string // 0, 1
type RuleDetailType = 
[FromGroup, ToGroup, TargetNumber, TargetTodoName] | 
[FromGroup, ToGroup, TargetGroupVisibility]

export const ruleTypeEnum = ["conditional-add", "planned-toggle-group"] as [string, ...string[]]

export const rules = createTable("rule", {
  ruleId: varchar("ruleId", { length: 255 }).notNull().primaryKey(),
  ruleOwner: varchar("ruleOwner", { length: 255 })
    .notNull()
    .references(() => users.id),
  ruleTitle: varchar("ruleTitle", { length: 255 }).notNull(),
  ruleDescription: varchar("ruleDescription", { length: 255 }),
  ruleType: text("ruleType", {
    enum: ruleTypeEnum,
  }).notNull(),
  ruleDetail: text("ruleDetail").array().$type<RuleDetailType>(),
  ruleEnable: boolean("ruleEnable").notNull(),
  ruleCreatedAt: timestamp("ruleCreatedAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  ruleGateNumber: integer("ruleGateNumber").notNull(),
  ruleCurrentNumber: integer("ruleCurrentNumber").default(0).notNull(),
});


export const rulesRelations = relations(rules, ({one}) => ({
    users: one(users, {
        fields: [rules.ruleOwner],
        references: [users.id]
    }),
}))

export const groups = createTable("group", {
  groupId: varchar("groupId", { length: 255 }).notNull().primaryKey(),
  groupOwner: varchar("groupOwner", { length: 255 })
    .notNull()
    .references(() => users.id),
  groupTitle: varchar("groupTitle", { length: 255 }).notNull(),
  groupDescription: varchar("groupDescription", { length: 255 }),
  groupCreatedAt: timestamp("groupCreatedAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  groupInvisible: boolean("groupInvisible").notNull(),
  baseRule: varchar("baseRule", { length: 255 }).references(() => rules.ruleId),
});

export const groupsRelations = relations(groups, ({one, many}) => ({
    users: one(users, {
        fields: [groups.groupOwner],
        references: [users.id]
    }),
    todos: many(todos),
    rules: one(rules, {
        fields: [groups.baseRule],
        references: [rules.ruleId]
    })
}))