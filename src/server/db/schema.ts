import { sql } from 'drizzle-orm'
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const createTable = pgTableCreator((name) => `daily-workout_${name}`)

export const workouts = createTable(
  'workouts',
  {
    id: serial('id').primaryKey(),
    date: varchar('date').notNull(),
    workout: varchar('workout').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }),
  },
  (workout) => ({
    nameIndex: index('date_idx').on(workout.date),
  }),
)
