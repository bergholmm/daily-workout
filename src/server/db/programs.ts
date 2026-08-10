import "server-only"

import { and, asc, eq, lte, or } from "drizzle-orm"

import type { WorkoutSection } from "@/lib/types"

import { db } from "."
import { programWorkouts, programs } from "./schema"

// Programs CRUD

export async function listPrograms() {
  return db.select().from(programs).orderBy(programs.createdAt)
}

export async function getProgram(id: number) {
  const result = await db
    .select()
    .from(programs)
    .where(eq(programs.id, id))
    .limit(1)
  return result[0] ?? null
}

export async function getPublicProgramBySlug(slug: string) {
  const result = await db
    .select()
    .from(programs)
    .where(and(eq(programs.slug, slug), eq(programs.isPublic, true)))
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

export async function deleteProgram(id: number) {
  const result = await db
    .delete(programs)
    .where(eq(programs.id, id))
    .returning()
  return result[0] ?? null
}

// Program Workouts CRUD

export async function listProgramWorkouts(programId: number) {
  return db
    .select()
    .from(programWorkouts)
    .where(eq(programWorkouts.programId, programId))
    .orderBy(programWorkouts.date)
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
      asc(programWorkouts.weekNumber),
      asc(programWorkouts.sessionNumber),
      asc(programWorkouts.id),
    )
}

export async function getVisiblePublicProgramWorkoutBySlot(
  slug: string,
  weekNumber: number,
  sessionNumber: number,
  now = new Date(),
) {
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
      weekNumber: programWorkouts.weekNumber,
      sessionNumber: programWorkouts.sessionNumber,
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
        eq(programWorkouts.weekNumber, weekNumber),
        eq(programWorkouts.sessionNumber, sessionNumber),
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

export async function deleteProgramWorkout(id: number) {
  const result = await db
    .delete(programWorkouts)
    .where(eq(programWorkouts.id, id))
    .returning()
  return result[0] ?? null
}
