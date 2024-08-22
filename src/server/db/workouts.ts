import 'server-only'

import { and, eq } from 'drizzle-orm'

import { type WorkoutName } from '~/lib/types'

import { db } from '.'
import { workouts } from './schema'

export const getWorkout = async (date: string, name: WorkoutName) => {
  const workout = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.date, date), eq(workouts.workoutName, name)))
    .limit(1)

  if (workout.length === 0) {
    return undefined
  }

  return workout[0]!
}

export const createWorkout = async (
  workout: string[],
  date: string,
  workoutName: WorkoutName,
) => {
  const w = await db
    .insert(workouts)
    .values({
      workout,
      date,
      workoutName,
    })
    .returning()

  return w[0]!
}
