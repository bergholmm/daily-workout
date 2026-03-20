import { type getWorkout } from '~/server/db/workouts'

export type WorkoutName = 'invictus' | 'pushjerk' | 'linchpin'

export type Workout = Exclude<Awaited<ReturnType<typeof getWorkout>>, undefined>

export type ExtendedError = Error & { status: number; info: string }
