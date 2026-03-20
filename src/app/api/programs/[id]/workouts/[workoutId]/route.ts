import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import * as db from "@/server/db/programs"

import { updateProgramWorkoutSchema } from "@/lib/validators"

type Params = { params: Promise<{ id: string; workoutId: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { workoutId } = await params
  const body = await req.json()
  const parsed = updateProgramWorkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const workout = await db.updateProgramWorkout(Number(workoutId), parsed.data)
  if (!workout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(workout)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { workoutId } = await params
  const workout = await db.deleteProgramWorkout(Number(workoutId))
  if (!workout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(workout)
}
