import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import type { TrainingRecordEntry, WorkoutSection } from "@/lib/types"

export const providerNameEnum = pgEnum("provider_name", [
  "pushjerk",
  "linchpin",
])

export const programWorkoutStatusEnum = pgEnum("program_workout_status", [
  "draft",
  "scheduled",
  "published",
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

export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }),
    description: text("description"),
    isPublic: boolean("is_public").notNull().default(false),
    startDate: varchar("start_date", { length: 10 }),
    durationWeeks: integer("duration_weeks"),
    createdBy: varchar("created_by", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [uniqueIndex("programs_slug_idx").on(table.slug)],
)

export const programWorkouts = pgTable(
  "program_workouts",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    date: varchar("date", { length: 10 }).notNull(),
    title: varchar("title", { length: 255 }),
    summary: text("summary"),
    content: jsonb("content").$type<WorkoutSection[]>().notNull().default([]),
    videoUrl: text("video_url"),
    status: programWorkoutStatusEnum("status").notNull().default("draft"),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    publicationKey: varchar("publication_key", { length: 255 }),
    weekNumber: integer("week_number"),
    sessionNumber: integer("session_number"),
    durationMinutes: integer("duration_minutes"),
    focus: text("focus")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    equipment: text("equipment")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("program_workouts_program_date_idx").on(table.programId, table.date),
    uniqueIndex("program_workouts_publication_key_idx").on(
      table.publicationKey,
    ),
  ],
)

export const trainingRecords = pgTable(
  "training_records",
  {
    id: serial("id").primaryKey(),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => programWorkouts.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).notNull(),
    entries: jsonb("entries")
      .$type<TrainingRecordEntry[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("training_records_user_workout_idx").on(
      table.userId,
      table.workoutId,
    ),
    index("training_records_user_updated_idx").on(
      table.userId,
      table.updatedAt,
    ),
  ],
)
