import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "."
import type { ProviderName } from "./schema"
import { workouts } from "./schema"

export async function getProviderWorkout(
  date: string,
  providerName: ProviderName,
) {
  const result = await db
    .select()
    .from(workouts)
    .where(
      and(eq(workouts.date, date), eq(workouts.providerName, providerName)),
    )
    .limit(1)

  return result[0] ?? null
}

export async function createProviderWorkout(
  content: string[],
  date: string,
  providerName: ProviderName,
) {
  const result = await db
    .insert(workouts)
    .values({ content, date, providerName })
    .returning()

  return result[0]!
}
