import { type NextRequest } from 'next/server'

import { getWorkout } from '~/server/workouts'

import { safeAsync } from '~/lib/safeAsync'
import { type WorkoutName } from '~/lib/types'

// GET /api/getWorkout
// Expected query params: date (optional) (format: YYYY-MM-DD)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const date =
    searchParams.get('date') ?? new Date().toISOString().split('T')[0]!
  const workoutName: WorkoutName =
    (searchParams.get('workoutName') as WorkoutName) ??
    ('invictus' as WorkoutName)

  console.log(`Getting ${workoutName} for date: ${date}`)
  const [res, err] = await safeAsync(getWorkout(workoutName, date))

  if (err?.message === 'Workout not found') {
    console.warn(err.message)
    return new Response(err.message, { status: 404 })
  }

  if (err) {
    console.error(err)
    return new Response(`Error: ${err.message}`, { status: 500 })
  }

  return Response.json(res)
}
