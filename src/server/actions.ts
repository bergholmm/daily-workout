import 'server-only'

import { db } from './db'
import { workouts } from './db/schema'

// export const createResult = async () => { }
// export const getResult = async () => { }

export const getWorkout = async (date: string) => {
  const workout = await db.query.workouts.findFirst({
    where: (workouts, { eq }) => eq(workouts.date, date),
  })

  return workout
}

export const createWorkout = async (workout: string, date: string) => {
  await db
    .insert(workouts)
    .values({
      workout,
      date
    })
}
