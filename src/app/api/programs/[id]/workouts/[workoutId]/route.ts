import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import * as db from "@/server/db/programs"

import { updateProgramWorkoutSchema } from "@/lib/validators"

type Params = { params: Promise<{ id: string; workoutId: string }> }

async function getOwnedWorkout(params: Params["params"], userId: string) {
  const { id, workoutId } = await params
  const programId = Number(id)
  const numericWorkoutId = Number(workoutId)
  if (
    !Number.isSafeInteger(programId) ||
    programId <= 0 ||
    !Number.isSafeInteger(numericWorkoutId) ||
    numericWorkoutId <= 0
  ) {
    return null
  }

  const [ownedProgram, workout] = await Promise.all([
    db.getProgramForOwner(programId, userId),
    db.getProgramWorkout(numericWorkoutId, programId),
  ])
  return ownedProgram && workout ? { workoutId: numericWorkoutId } : null
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ownedWorkout = await getOwnedWorkout(params, userId)
  if (!ownedWorkout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateProgramWorkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const workout = await db.updateProgramWorkout(
    ownedWorkout.workoutId,
    parsed.data,
  )
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

  const ownedWorkout = await getOwnedWorkout(params, userId)
  if (!ownedWorkout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const result = await db.deleteOrArchiveProgramWorkout(ownedWorkout.workoutId)
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ ...result.item, disposition: result.disposition })
}
