import { sql } from 'drizzle-orm'
import {
  index,
  pgEnum,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const createTable = pgTableCreator((name) => `daily-workout_${name}`)

export const workoutNameEnum = pgEnum('workoutName', [
  'invictus',
  'pushjerk',
  'linchpin',
])

export const workouts = createTable(
  'workouts',
  {
    id: serial('id').primaryKey(),
    date: varchar('date').notNull(),
    workout: text('workout')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    workoutName: workoutNameEnum('workoutName').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }),
  },
  (workout) => ({
    dateIdx: index('date_idx').on(workout.date),
    nameIdx: index('name_idx').on(workout.workoutName),
  }),
)
