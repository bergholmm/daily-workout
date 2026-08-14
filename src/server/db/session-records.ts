import { and, desc, eq, lt, lte, or } from "drizzle-orm"

import type { SessionRecordEntry } from "@/lib/types"

import { db } from "."
import {
  programRuns,
  programWorkouts,
  programs,
  sessionRecords,
} from "./schema"

const recordSelection = {
  id: sessionRecords.id,
  programRunId: sessionRecords.programRunId,
  workoutId: sessionRecords.workoutId,
  weekNumber: sessionRecords.weekNumber,
  entries: sessionRecords.entries,
  createdAt: sessionRecords.createdAt,
  updatedAt: sessionRecords.updatedAt,
}

const runSelection = {
  id: programRuns.id,
  programId: programRuns.programId,
  status: programRuns.status,
  startedAt: programRuns.startedAt,
  endedAt: programRuns.endedAt,
}

export async function getVisiblePublicWorkoutForRecord(workoutId: number) {
  const now = new Date()
  const [workout] = await db
    .select({
      id: programWorkouts.id,
      programId: programWorkouts.programId,
      phaseNumber: programWorkouts.phaseNumber,
      emphasisNumber: programWorkouts.emphasisNumber,
      content: programWorkouts.content,
    })
    .from(programWorkouts)
    .innerJoin(programs, eq(programWorkouts.programId, programs.id))
    .where(
      and(
        eq(programWorkouts.id, workoutId),
        eq(programs.isPublic, true),
        or(
          eq(programWorkouts.status, "published"),
          and(
            eq(programWorkouts.status, "scheduled"),
            lte(programWorkouts.publishAt, now),
          ),
        ),
      ),
    )
    .limit(1)

  return workout
}

export async function getLatestProgramRun(userId: string, programId: number) {
  const [run] = await db
    .select(runSelection)
    .from(programRuns)
    .where(
      and(eq(programRuns.userId, userId), eq(programRuns.programId, programId)),
    )
    .orderBy(desc(programRuns.startedAt), desc(programRuns.id))
    .limit(1)

  return run ?? null
}

async function getActiveProgramRun(userId: string, programId: number) {
  const [run] = await db
    .select(runSelection)
    .from(programRuns)
    .where(
      and(
        eq(programRuns.userId, userId),
        eq(programRuns.programId, programId),
        eq(programRuns.status, "active"),
      ),
    )
    .limit(1)

  return run ?? null
}

async function getOrCreateActiveProgramRun(userId: string, programId: number) {
  const activeRun = await getActiveProgramRun(userId, programId)
  if (activeRun) return activeRun

  await db
    .insert(programRuns)
    .values({ userId, programId })
    .onConflictDoNothing()

  const createdRun = await getActiveProgramRun(userId, programId)
  if (!createdRun) throw new Error("Could not start the program run")
  return createdRun
}

type SessionOccurrenceKey = {
  userId: string
  programId: number
  workoutId: number
  weekNumber: number
}

type PreviousSessionOccurrenceKey = Omit<SessionOccurrenceKey, "workoutId"> & {
  emphasisNumber: number
}

export async function getSessionRecord({
  userId,
  programId,
  workoutId,
  weekNumber,
}: SessionOccurrenceKey) {
  const run = await getLatestProgramRun(userId, programId)
  if (!run) return null

  const [record] = await db
    .select(recordSelection)
    .from(sessionRecords)
    .where(
      and(
        eq(sessionRecords.userId, userId),
        eq(sessionRecords.programRunId, run.id),
        eq(sessionRecords.workoutId, workoutId),
        eq(sessionRecords.weekNumber, weekNumber),
      ),
    )
    .limit(1)

  return record ?? null
}

export async function getPreviousSessionRecord({
  userId,
  programId,
  emphasisNumber,
  weekNumber,
}: PreviousSessionOccurrenceKey) {
  const run = await getLatestProgramRun(userId, programId)
  if (!run) return null

  const [record] = await db
    .select(recordSelection)
    .from(sessionRecords)
    .innerJoin(
      programWorkouts,
      eq(sessionRecords.workoutId, programWorkouts.id),
    )
    .where(
      and(
        eq(sessionRecords.userId, userId),
        eq(sessionRecords.programRunId, run.id),
        eq(programWorkouts.programId, programId),
        eq(programWorkouts.emphasisNumber, emphasisNumber),
        lt(sessionRecords.weekNumber, weekNumber),
      ),
    )
    .orderBy(desc(sessionRecords.weekNumber))
    .limit(1)

  return record ?? null
}

export async function listRecordedSessions(userId: string, programId: number) {
  const run = await getLatestProgramRun(userId, programId)
  if (!run) return { run: null, records: [] }

  const records = await db
    .select({
      workoutId: sessionRecords.workoutId,
      weekNumber: sessionRecords.weekNumber,
    })
    .from(sessionRecords)
    .where(
      and(
        eq(sessionRecords.userId, userId),
        eq(sessionRecords.programRunId, run.id),
      ),
    )

  return { run, records }
}

export async function saveSessionRecord({
  userId,
  programId,
  workoutId,
  weekNumber,
  entries,
}: SessionOccurrenceKey & { entries: SessionRecordEntry[] }) {
  const run = await getOrCreateActiveProgramRun(userId, programId)
  const [record] = await db
    .insert(sessionRecords)
    .values({
      userId,
      programRunId: run.id,
      workoutId,
      weekNumber,
      entries,
    })
    .onConflictDoUpdate({
      target: [
        sessionRecords.programRunId,
        sessionRecords.workoutId,
        sessionRecords.weekNumber,
      ],
      set: {
        entries,
        updatedAt: new Date(),
      },
    })
    .returning(recordSelection)

  return record
}

export async function startNewProgramRun(userId: string, programId: number) {
  const activeRun = await getActiveProgramRun(userId, programId)
  if (activeRun) {
    const records = await db
      .select({ id: sessionRecords.id })
      .from(sessionRecords)
      .where(eq(sessionRecords.programRunId, activeRun.id))

    await db
      .update(programRuns)
      .set({
        status: records.length >= 36 ? "completed" : "abandoned",
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(programRuns.id, activeRun.id))
  }

  const [run] = await db
    .insert(programRuns)
    .values({ userId, programId })
    .returning(runSelection)

  return run
}
