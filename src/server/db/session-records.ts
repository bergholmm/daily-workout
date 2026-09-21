import {
  and,
  desc,
  eq,
  exists,
  isNotNull,
  isNull,
  lt,
  lte,
  or,
} from "drizzle-orm"

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
  performedOn: sessionRecords.performedOn,
  entries: sessionRecords.entries,
  note: sessionRecords.note,
  createdAt: sessionRecords.createdAt,
  updatedAt: sessionRecords.updatedAt,
}

export async function getAccessibleWorkoutForRecord(
  workoutId: number,
  userId: string,
) {
  const [workout] = await db
    .select({
      id: programWorkouts.id,
      programId: programWorkouts.programId,
      phaseNumber: programWorkouts.phaseNumber,
      emphasisNumber: programWorkouts.emphasisNumber,
      content: programWorkouts.content,
      archivedAt: programWorkouts.archivedAt,
      programArchivedAt: programs.archivedAt,
      unrestrictedRecordsEnabled: programs.unrestrictedRecordsEnabled,
    })
    .from(programWorkouts)
    .innerJoin(programs, eq(programWorkouts.programId, programs.id))
    .where(
      and(
        eq(programWorkouts.id, workoutId),
        isNull(programWorkouts.archivedAt),
        isNull(programs.archivedAt),
        eq(programs.unrestrictedRecordsEnabled, true),
        or(
          eq(programs.createdBy, userId),
          eq(programs.isShared, true),
          eq(programs.isPublic, true),
        ),
      ),
    )
    .limit(1)

  return workout ?? null
}

export async function getAccessibleWorkoutForHistory(
  workoutId: number,
  userId: string,
) {
  const ownHistory = exists(
    db
      .select({ id: sessionRecords.id })
      .from(sessionRecords)
      .where(
        and(
          eq(sessionRecords.workoutId, programWorkouts.id),
          eq(sessionRecords.userId, userId),
        ),
      ),
  )
  const isOwner = eq(programs.createdBy, userId)
  const [workout] = await db
    .select({
      id: programWorkouts.id,
      programId: programWorkouts.programId,
      phaseNumber: programWorkouts.phaseNumber,
      emphasisNumber: programWorkouts.emphasisNumber,
      content: programWorkouts.content,
      archivedAt: programWorkouts.archivedAt,
      programArchivedAt: programs.archivedAt,
      unrestrictedRecordsEnabled: programs.unrestrictedRecordsEnabled,
    })
    .from(programWorkouts)
    .innerJoin(programs, eq(programWorkouts.programId, programs.id))
    .where(
      and(
        eq(programWorkouts.id, workoutId),
        or(isNull(programWorkouts.archivedAt), isOwner, ownHistory),
        or(eq(programs.unrestrictedRecordsEnabled, true), ownHistory),
        or(
          and(
            isNull(programs.archivedAt),
            or(
              isOwner,
              eq(programs.isShared, true),
              eq(programs.isPublic, true),
            ),
          ),
          and(isNotNull(programs.archivedAt), or(isOwner, ownHistory)),
        ),
      ),
    )
    .limit(1)

  return workout ?? null
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
        isNull(programs.archivedAt),
        isNull(programWorkouts.archivedAt),
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
        isNotNull(sessionRecords.weekNumber),
      ),
    )

  return {
    run,
    records: records.flatMap((record) =>
      record.weekNumber === null
        ? []
        : [{ ...record, weekNumber: record.weekNumber }],
    ),
  }
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

export async function listUnrestrictedSessionRecords({
  userId,
  workoutId,
}: {
  userId: string
  workoutId: number
}) {
  return db
    .select(recordSelection)
    .from(sessionRecords)
    .where(
      and(
        eq(sessionRecords.userId, userId),
        eq(sessionRecords.workoutId, workoutId),
        isNull(sessionRecords.programRunId),
        isNull(sessionRecords.weekNumber),
      ),
    )
    .orderBy(
      desc(sessionRecords.performedOn),
      desc(sessionRecords.createdAt),
      desc(sessionRecords.id),
    )
}

type UnrestrictedSessionRecordKey = {
  id: number
  userId: string
  workoutId: number
}

function unrestrictedSessionRecordCondition({
  id,
  userId,
  workoutId,
}: UnrestrictedSessionRecordKey) {
  return and(
    eq(sessionRecords.id, id),
    eq(sessionRecords.userId, userId),
    eq(sessionRecords.workoutId, workoutId),
    isNull(sessionRecords.programRunId),
    isNull(sessionRecords.weekNumber),
  )
}

export async function getUnrestrictedSessionRecord({
  id,
  userId,
  workoutId,
}: UnrestrictedSessionRecordKey) {
  const [record] = await db
    .select(recordSelection)
    .from(sessionRecords)
    .where(unrestrictedSessionRecordCondition({ id, userId, workoutId }))
    .limit(1)

  return record ?? null
}

export async function createUnrestrictedSessionRecord({
  userId,
  workoutId,
  performedOn,
  entries,
  note,
}: {
  userId: string
  workoutId: number
  performedOn: string
  entries: SessionRecordEntry[]
  note: string | null
}) {
  const [record] = await db
    .insert(sessionRecords)
    .values({
      userId,
      programRunId: null,
      workoutId,
      weekNumber: null,
      performedOn,
      entries,
      note,
    })
    .returning(recordSelection)

  return record!
}

export async function updateUnrestrictedSessionRecord({
  id,
  userId,
  workoutId,
  performedOn,
  entries,
  note,
}: UnrestrictedSessionRecordKey & {
  performedOn: string
  entries: SessionRecordEntry[]
  note: string | null
}) {
  const [record] = await db
    .update(sessionRecords)
    .set({ performedOn, entries, note, updatedAt: new Date() })
    .where(unrestrictedSessionRecordCondition({ id, userId, workoutId }))
    .returning(recordSelection)

  return record ?? null
}

export async function deleteUnrestrictedSessionRecord({
  id,
  userId,
  workoutId,
}: UnrestrictedSessionRecordKey) {
  const [record] = await db
    .delete(sessionRecords)
    .where(unrestrictedSessionRecordCondition({ id, userId, workoutId }))
    .returning(recordSelection)

  return record ?? null
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
