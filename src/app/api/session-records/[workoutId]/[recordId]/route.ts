import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import * as recordsDb from "@/server/db/session-records"

import { parseUnrestrictedRecordInput } from "../../record-input"

type Params = {
  params: Promise<{ workoutId: string; recordId: string }>
}

function parseId(value: string) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rawParams = await params
  const workoutId = parseId(rawParams.workoutId)
  const recordId = parseId(rawParams.recordId)
  if (!workoutId || !recordId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const workout = await recordsDb.getAccessibleWorkoutForHistory(
    workoutId,
    userId,
  )
  if (!workout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const existingRecord = await recordsDb.getUnrestrictedSessionRecord({
    id: recordId,
    userId,
    workoutId,
  })
  if (!existingRecord) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const parsed = parseUnrestrictedRecordInput(
    await request.json(),
    workout.content,
    undefined,
    existingRecord.entries,
  )
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const record = await recordsDb.updateUnrestrictedSessionRecord({
    id: recordId,
    userId,
    workoutId,
    ...parsed.data,
  })
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(record)
}

export async function DELETE(_request: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rawParams = await params
  const workoutId = parseId(rawParams.workoutId)
  const recordId = parseId(rawParams.recordId)
  if (!workoutId || !recordId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const workout = await recordsDb.getAccessibleWorkoutForHistory(
    workoutId,
    userId,
  )
  if (!workout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const record = await recordsDb.deleteUnrestrictedSessionRecord({
    id: recordId,
    userId,
    workoutId,
  })
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(record)
}
