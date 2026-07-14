import { and, eq, lte, or } from "drizzle-orm"

import type { TrainingRecordEntry } from "@/lib/types"

import { db } from "."
import { programWorkouts, programs, trainingRecords } from "./schema"

const recordSelection = {
  id: trainingRecords.id,
  workoutId: trainingRecords.workoutId,
  entries: trainingRecords.entries,
  createdAt: trainingRecords.createdAt,
  updatedAt: trainingRecords.updatedAt,
}

export async function getVisiblePublicWorkoutForRecord(workoutId: number) {
  const now = new Date()
  const [workout] = await db
    .select({
      id: programWorkouts.id,
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

export async function getTrainingRecord(userId: string, workoutId: number) {
  const [record] = await db
    .select(recordSelection)
    .from(trainingRecords)
    .where(
      and(
        eq(trainingRecords.userId, userId),
        eq(trainingRecords.workoutId, workoutId),
      ),
    )
    .limit(1)

  return record ?? null
}

export async function saveTrainingRecord(
  userId: string,
  workoutId: number,
  entries: TrainingRecordEntry[],
) {
  const [record] = await db
    .insert(trainingRecords)
    .values({ userId, workoutId, entries })
    .onConflictDoUpdate({
      target: [trainingRecords.userId, trainingRecords.workoutId],
      set: {
        entries,
        updatedAt: new Date(),
      },
    })
    .returning(recordSelection)

  return record
}
