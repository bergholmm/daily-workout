import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import * as recordsDb from "@/server/db/session-records"

import { saveSessionRecordSchema } from "@/lib/validators"

type Params = { params: Promise<{ workoutId: string }> }

function parseWorkoutId(value: string) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function parseWeek(request: Request) {
  const week = Number(new URL(request.url).searchParams.get("week"))
  return Number.isInteger(week) && week >= 1 && week <= 12 ? week : null
}

function getRecordFields(
  workout: Awaited<
    ReturnType<typeof recordsDb.getVisiblePublicWorkoutForRecord>
  >,
) {
  const section = workout?.content.find(
    (item) => "kind" in item && item.kind === "record",
  )

  return section && "fields" in section ? section.fields : []
}

async function getWorkout(workoutId: string) {
  const id = parseWorkoutId(workoutId)
  if (!id) return null
  return recordsDb.getVisiblePublicWorkoutForRecord(id)
}

export async function GET(request: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { workoutId } = await params
  const workout = await getWorkout(workoutId)
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 })
  }

  const weekNumber = parseWeek(request)
  if (
    !weekNumber ||
    workout.phaseNumber !== Math.ceil(weekNumber / 4) ||
    !workout.emphasisNumber
  ) {
    return NextResponse.json({ error: "Invalid program week" }, { status: 400 })
  }

  const [record, previousRecord] = await Promise.all([
    recordsDb.getSessionRecord({
      userId,
      programId: workout.programId,
      workoutId: workout.id,
      weekNumber,
    }),
    recordsDb.getPreviousSessionRecord({
      userId,
      programId: workout.programId,
      emphasisNumber: workout.emphasisNumber,
      weekNumber,
    }),
  ])
  return NextResponse.json({ record, previousRecord })
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

  const weekNumber = parseWeek(request)
  if (!weekNumber || workout.phaseNumber !== Math.ceil(weekNumber / 4)) {
    return NextResponse.json({ error: "Invalid program week" }, { status: 400 })
  }

  const parsed = saveSessionRecordSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const fields = getRecordFields(workout)
  const submittedFieldIds = new Set(
    parsed.data.entries.map((entry) => entry.fieldId),
  )
  const fieldsMatch =
    fields.length > 0 &&
    submittedFieldIds.size === parsed.data.entries.length &&
    submittedFieldIds.size === fields.length &&
    fields.every((field) => submittedFieldIds.has(field.id))

  if (!fieldsMatch) {
    return NextResponse.json(
      { error: "Record fields do not match this workout" },
      { status: 400 },
    )
  }

  const submittedValues = new Map(
    parsed.data.entries.map((entry) => [entry.fieldId, entry.value]),
  )
  const entries = fields.map((field) => ({
    fieldId: field.id,
    label: field.label,
    value: submittedValues.get(field.id) ?? "",
  }))

  const record = await recordsDb.saveSessionRecord({
    userId,
    programId: workout.programId,
    workoutId: workout.id,
    weekNumber,
    entries,
  })
  return NextResponse.json(record)
}
