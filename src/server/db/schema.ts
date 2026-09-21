import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
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

import type { SessionRecordEntry, WorkoutSection } from "@/lib/types"

export const providerNameEnum = pgEnum("provider_name", [
  "pushjerk",
  "linchpin",
])

export const programWorkoutStatusEnum = pgEnum("program_workout_status", [
  "draft",
  "scheduled",
  "published",
])

export const programRunStatusEnum = pgEnum("program_run_status", [
  "active",
  "completed",
  "abandoned",
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
    isShared: boolean("is_shared").notNull().default(false),
    unrestrictedRecordsEnabled: boolean("unrestricted_records_enabled")
      .notNull()
      .default(false),
    startDate: varchar("start_date", { length: 10 }),
    durationWeeks: integer("duration_weeks"),
    createdBy: varchar("created_by", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
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
    phaseNumber: integer("phase_number"),
    weekNumber: integer("week_number"),
    emphasisNumber: integer("session_number"),
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
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    index("program_workouts_program_date_idx").on(table.programId, table.date),
    uniqueIndex("program_workouts_publication_key_idx").on(
      table.publicationKey,
    ),
  ],
)

export const programRuns = pgTable(
  "program_runs",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).notNull(),
    status: programRunStatusEnum("status").notNull().default("active"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("program_runs_user_program_started_idx").on(
      table.userId,
      table.programId,
      table.startedAt,
    ),
    uniqueIndex("program_runs_active_user_program_idx")
      .on(table.userId, table.programId)
      .where(sql`${table.status} = 'active'`),
  ],
)

export const sessionRecords = pgTable(
  "training_records",
  {
    id: serial("id").primaryKey(),
    programRunId: integer("program_run_id").references(() => programRuns.id, {
      onDelete: "restrict",
    }),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => programWorkouts.id, { onDelete: "restrict" }),
    userId: varchar("user_id", { length: 255 }).notNull(),
    weekNumber: integer("week_number"),
    performedOn: date("performed_on")
      .notNull()
      .default(sql`CURRENT_DATE`),
    entries: jsonb("entries")
      .$type<SessionRecordEntry[]>()
      .notNull()
      .default([]),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("training_records_run_workout_week_idx").on(
      table.programRunId,
      table.workoutId,
      table.weekNumber,
    ),
    index("training_records_user_updated_idx").on(
      table.userId,
      table.updatedAt,
    ),
    index("training_records_user_workout_performed_idx").on(
      table.userId,
      table.workoutId,
      table.performedOn,
    ),
    check(
      "training_records_occurrence_pair_check",
      sql`(${table.programRunId} is null and ${table.weekNumber} is null) or (${table.programRunId} is not null and ${table.weekNumber} is not null)`,
    ),
  ],
)
