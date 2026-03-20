import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import * as db from "@/server/db/programs"

import { createProgramWorkoutSchema } from "@/lib/validators"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const workouts = await db.listProgramWorkouts(Number(id))
  return NextResponse.json(workouts)
}

export async function POST(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = createProgramWorkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const workout = await db.createProgramWorkout({
    ...parsed.data,
    programId: Number(id),
  })

  return NextResponse.json(workout, { status: 201 })
}
