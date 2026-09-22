import "server-only"

import {
  and,
  asc,
  eq,
  exists,
  isNotNull,
  isNull,
  lte,
  notExists,
  or,
} from "drizzle-orm"

import type { WorkoutSection } from "@/lib/types"

import { db } from "."
import { programWorkouts, programs, sessionRecords } from "./schema"

function userHasProgramHistory(userId: string) {
  return exists(
    db
      .select({ id: sessionRecords.id })
      .from(sessionRecords)
      .innerJoin(
        programWorkouts,
        eq(sessionRecords.workoutId, programWorkouts.id),
      )
      .where(
        and(
          eq(programWorkouts.programId, programs.id),
          eq(sessionRecords.userId, userId),
        ),
      ),
  )
}

function userHasWorkoutHistory(userId: string) {
  return exists(
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
}

function activeProgramAccess(userId: string) {
  return and(
    isNull(programs.archivedAt),
    or(
      eq(programs.createdBy, userId),
      eq(programs.isShared, true),
      eq(programs.isPublic, true),
    ),
  )
}

function archivedProgramAccess(userId: string) {
  return and(
    isNotNull(programs.archivedAt),
    or(eq(programs.createdBy, userId), userHasProgramHistory(userId)),
  )
}

function programAccess(userId: string) {
  return or(activeProgramAccess(userId), archivedProgramAccess(userId))
}

// Programs CRUD

export async function listPrograms(userId: string) {
  return db
    .select()
    .from(programs)
    .where(programAccess(userId))
    .orderBy(programs.createdAt)
}

export async function getProgram(id: number) {
  const result = await db
    .select()
    .from(programs)
    .where(eq(programs.id, id))
    .limit(1)
  return result[0] ?? null
}

export async function getAccessibleProgram(id: number, userId: string) {
  const [program] = await db
    .select()
    .from(programs)
    .where(and(eq(programs.id, id), programAccess(userId)))
    .limit(1)

  return program ?? null
}

export async function getProgramForOwner(id: number, userId: string) {
  const [program] = await db
    .select()
    .from(programs)
    .where(
      and(
        eq(programs.id, id),
        eq(programs.createdBy, userId),
        isNull(programs.archivedAt),
      ),
    )
    .limit(1)

  return program ?? null
}

export async function getPublicProgramBySlug(slug: string) {
  const result = await db
    .select()
    .from(programs)
    .where(
      and(
        eq(programs.slug, slug),
        eq(programs.isPublic, true),
        isNull(programs.archivedAt),
      ),
    )
    .limit(1)
  return result[0] ?? null
}

export async function createProgram(data: {
  name: string
  description?: string | null
  createdBy: string
}) {
  const result = await db.insert(programs).values(data).returning()
  return result[0]!
}

export async function updateProgram(
  id: number,
  data: { name?: string; description?: string | null },
) {
  const result = await db
    .update(programs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(programs.id, id))
    .returning()
  return result[0] ?? null
}

function isForeignKeyViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23503"
  )
}

async function deleteOrArchiveItem<T>(
  deleteItem: () => Promise<T | undefined>,
  archiveItem: () => Promise<T | undefined>,
) {
  try {
    const item = await deleteItem()
    if (item) return { item, disposition: "deleted" as const }
  } catch (error) {
    // A Session record can be inserted after the history check. Restrictive
    // foreign keys turn that race into archival instead of data loss.
    if (!isForeignKeyViolation(error)) throw error
  }

  const item = await archiveItem()
  return item ? { item, disposition: "archived" as const } : null
}

export async function deleteOrArchiveProgram(id: number) {
  return deleteOrArchiveItem(
    async () => {
      const [item] = await db
        .delete(programs)
        .where(
          and(
            eq(programs.id, id),
            notExists(
              db
                .select({ id: sessionRecords.id })
                .from(sessionRecords)
                .innerJoin(
                  programWorkouts,
                  eq(sessionRecords.workoutId, programWorkouts.id),
                )
                .where(eq(programWorkouts.programId, id)),
            ),
          ),
        )
        .returning()
      return item
    },
    async () => {
      const [item] = await db
        .update(programs)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(eq(programs.id, id))
        .returning()
      return item
    },
  )
}

// Program Workouts CRUD

export async function listProgramWorkouts({
  programId,
  userId,
  canEdit,
  programArchived,
}: {
  programId: number
  userId: string
  canEdit: boolean
  programArchived: boolean
}) {
  return db
    .select()
    .from(programWorkouts)
    .where(
      and(
        eq(programWorkouts.programId, programId),
        canEdit
          ? undefined
          : programArchived
            ? userHasWorkoutHistory(userId)
            : or(
                isNull(programWorkouts.archivedAt),
                userHasWorkoutHistory(userId),
              ),
      ),
    )
    .orderBy(
      programWorkouts.phaseNumber,
      programWorkouts.emphasisNumber,
      programWorkouts.date,
      programWorkouts.id,
    )
}

export async function listVisibleProgramWorkouts(
  programId: number,
  now = new Date(),
) {
  return db
    .select()
    .from(programWorkouts)
    .where(
      and(
        eq(programWorkouts.programId, programId),
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
    .orderBy(
      asc(programWorkouts.phaseNumber),
      asc(programWorkouts.emphasisNumber),
      asc(programWorkouts.id),
    )
}

export async function getVisiblePublicProgramWorkoutBySlot(
  slug: string,
  weekNumber: number,
  emphasisNumber: number,
  now = new Date(),
) {
  const phaseNumber = Math.ceil(weekNumber / 4)
  const [workout] = await db
    .select({
      id: programWorkouts.id,
      programId: programWorkouts.programId,
      date: programWorkouts.date,
      title: programWorkouts.title,
      summary: programWorkouts.summary,
      content: programWorkouts.content,
      videoUrl: programWorkouts.videoUrl,
      status: programWorkouts.status,
      publishAt: programWorkouts.publishAt,
      publicationKey: programWorkouts.publicationKey,
      phaseNumber: programWorkouts.phaseNumber,
      weekNumber: programWorkouts.weekNumber,
      emphasisNumber: programWorkouts.emphasisNumber,
      durationMinutes: programWorkouts.durationMinutes,
      focus: programWorkouts.focus,
      equipment: programWorkouts.equipment,
    })
    .from(programWorkouts)
    .innerJoin(programs, eq(programWorkouts.programId, programs.id))
    .where(
      and(
        eq(programs.slug, slug),
        eq(programs.isPublic, true),
        isNull(programs.archivedAt),
        isNull(programWorkouts.archivedAt),
        eq(programWorkouts.phaseNumber, phaseNumber),
        eq(programWorkouts.emphasisNumber, emphasisNumber),
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

  return workout ?? null
}

export async function getProgramWorkoutsByDate(
  programId: number,
  date: string,
) {
  return db
    .select()
    .from(programWorkouts)
    .where(
      and(
        eq(programWorkouts.programId, programId),
        eq(programWorkouts.date, date),
      ),
    )
}

export async function getProgramWorkout(id: number, programId: number) {
  const [workout] = await db
    .select()
    .from(programWorkouts)
    .where(
      and(eq(programWorkouts.id, id), eq(programWorkouts.programId, programId)),
    )
    .limit(1)

  return workout ?? null
}

export async function createProgramWorkout(data: {
  programId: number
  date: string
  title?: string | null
  content: WorkoutSection[]
  videoUrl?: string | null
}) {
  const result = await db.insert(programWorkouts).values(data).returning()
  return result[0]!
}

export async function updateProgramWorkout(
  id: number,
  data: {
    date?: string
    title?: string | null
    content?: WorkoutSection[]
    videoUrl?: string | null
  },
) {
  const result = await db
    .update(programWorkouts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(programWorkouts.id, id))
    .returning()
  return result[0] ?? null
}

export async function deleteOrArchiveProgramWorkout(id: number) {
  return deleteOrArchiveItem(
    async () => {
      const [item] = await db
        .delete(programWorkouts)
        .where(
          and(
            eq(programWorkouts.id, id),
            notExists(
              db
                .select({ id: sessionRecords.id })
                .from(sessionRecords)
                .where(eq(sessionRecords.workoutId, id)),
            ),
          ),
        )
        .returning()
      return item
    },
    async () => {
      const [item] = await db
        .update(programWorkouts)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(eq(programWorkouts.id, id))
        .returning()
      return item
    },
  )
}
