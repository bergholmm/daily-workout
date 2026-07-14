import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import * as recordsDb from "@/server/db/training-records"

import { saveTrainingRecordSchema } from "@/lib/validators"

type Params = { params: Promise<{ workoutId: string }> }

function parseWorkoutId(value: string) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function getRecordPrompts(
  workout: Awaited<
    ReturnType<typeof recordsDb.getVisiblePublicWorkoutForRecord>
  >,
) {
  return (
    workout?.content.find((section) =>
      section.title.trim().toLowerCase().startsWith("record"),
    )?.exercises ?? []
  )
}

async function getWorkout(workoutId: string) {
  const id = parseWorkoutId(workoutId)
  if (!id) return null
  return recordsDb.getVisiblePublicWorkoutForRecord(id)
}

export async function GET(_request: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { workoutId } = await params
  const workout = await getWorkout(workoutId)
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 })
  }

  const record = await recordsDb.getTrainingRecord(userId, workout.id)
  return NextResponse.json(record)
}

export async function PUT(request: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { workoutId } = await params
  const workout = await getWorkout(workoutId)
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 })
  }

  const parsed = saveTrainingRecordSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const prompts = getRecordPrompts(workout)
  const submittedPrompts = new Set(
    parsed.data.entries.map((entry) => entry.prompt),
  )
  const promptsMatch =
    prompts.length > 0 &&
    submittedPrompts.size === parsed.data.entries.length &&
    submittedPrompts.size === prompts.length &&
    prompts.every((prompt) => submittedPrompts.has(prompt))

  if (!promptsMatch) {
    return NextResponse.json(
      { error: "Record prompts do not match this workout" },
      { status: 400 },
    )
  }

  const record = await recordsDb.saveTrainingRecord(
    userId,
    workout.id,
    parsed.data.entries,
  )
  return NextResponse.json(record)
}
