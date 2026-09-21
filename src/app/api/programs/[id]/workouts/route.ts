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
  const programId = Number(id)
  const program = await db.getAccessibleProgram(programId, userId)
  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const canEdit = program.createdBy === userId
  const workouts = await db.listProgramWorkouts({
    programId,
    userId,
    canEdit,
    programArchived: Boolean(program.archivedAt),
  })
  return NextResponse.json(
    workouts.map((workout) => ({
      ...workout,
      canEdit: canEdit && !program.archivedAt && !workout.archivedAt,
    })),
  )
}

export async function POST(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const programId = Number(id)
  const ownedProgram = await db.getProgramForOwner(programId, userId)
  if (!ownedProgram) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = createProgramWorkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const workout = await db.createProgramWorkout({
    ...parsed.data,
    programId,
  })

  return NextResponse.json(workout, { status: 201 })
}
