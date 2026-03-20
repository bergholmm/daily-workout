import "server-only"

import { and, eq } from "drizzle-orm"

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
  content: string[]
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
    content?: string[]
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
