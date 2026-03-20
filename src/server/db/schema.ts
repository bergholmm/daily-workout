import { sql } from "drizzle-orm"
import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

export const providerNameEnum = pgEnum("provider_name", [
  "invictus",
  "pushjerk",
  "linchpin",
])

export type ProviderName = (typeof providerNameEnum.enumValues)[number]

export const workouts = pgTable(
  "workouts",
  {
    id: serial("id").primaryKey(),
    date: varchar("date", { length: 10 }).notNull(),
    content: text("content")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    providerName: providerNameEnum("provider_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("workouts_date_provider_idx").on(
      table.date,
      table.providerName,
    ),
  ],
)

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const programWorkouts = pgTable(
  "program_workouts",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    date: varchar("date", { length: 10 }).notNull(),
    title: varchar("title", { length: 255 }),
    content: text("content")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    videoUrl: text("video_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("program_workouts_program_date_idx").on(table.programId, table.date),
  ],
)
