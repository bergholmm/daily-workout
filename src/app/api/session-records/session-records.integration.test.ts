import "dotenv/config"
import { eq, inArray } from "drizzle-orm"
import { randomUUID } from "node:crypto"
import { afterEach, describe, expect, it, vi } from "vitest"

import { db } from "@/server/db"
import { programWorkouts, programs, sessionRecords } from "@/server/db/schema"

import { DELETE as deleteProgram } from "../programs/[id]/route"
import { DELETE as deleteWorkout } from "../programs/[id]/workouts/[workoutId]/route"
import { GET, POST } from "./[workoutId]/route"

const mocks = vi.hoisted(() => ({ auth: vi.fn() }))

vi.mock("server-only", () => ({}))
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))

const databaseDescribe =
  process.env.RUN_DATABASE_TESTS === "1" ? describe : describe.skip

const programIds: number[] = []
const workoutIds: number[] = []

async function createFixture() {
  const suffix = randomUUID()
  const ownerId = `integration_owner_${suffix}`
  const [program] = await db
    .insert(programs)
    .values({
      name: `Session record integration ${suffix}`,
      createdBy: ownerId,
      isShared: true,
      unrestrictedRecordsEnabled: true,
    })
    .returning()
  const [workout] = await db
    .insert(programWorkouts)
    .values({
      programId: program!.id,
      date: "2026-09-01",
      title: "Integration workout",
      content: [
        {
          title: "Strength",
          exercises: [
            {
              id: "back-squat",
              name: "Back squat",
              recordPrompt: { label: "Load and reps" },
            },
          ],
        },
      ],
    })
    .returning()

  programIds.push(program!.id)
  workoutIds.push(workout!.id)
  return { ownerId, program: program!, workout: workout! }
}

function recordRequest(workoutId: number, value: string) {
  return POST(
    new Request(`http://localhost/api/session-records/${workoutId}`, {
      method: "POST",
      body: JSON.stringify({
        performedOn: "2026-09-01",
        entries: [{ fieldId: "back-squat", value }],
        note: "Database-backed route test",
      }),
    }),
    { params: Promise.resolve({ workoutId: String(workoutId) }) },
  )
}

async function getHistory(workoutId: number) {
  return GET(new Request(`http://localhost/api/session-records/${workoutId}`), {
    params: Promise.resolve({ workoutId: String(workoutId) }),
  })
}

databaseDescribe("unrestricted Session record HTTP persistence", () => {
  afterEach(async () => {
    if (workoutIds.length > 0) {
      await db
        .delete(sessionRecords)
        .where(inArray(sessionRecords.workoutId, workoutIds.splice(0)))
    }
    if (programIds.length > 0) {
      await db
        .delete(programs)
        .where(inArray(programs.id, programIds.splice(0)))
    }
    vi.clearAllMocks()
  })

  it("stores same-date records separately, orders them deterministically, and isolates users", async () => {
    const { workout } = await createFixture()
    const firstUser = `integration_user_${randomUUID()}`
    const secondUser = `integration_user_${randomUUID()}`

    mocks.auth.mockResolvedValue({ userId: firstUser })
    const firstResponse = await recordRequest(workout.id, "80 kg x 5")
    const secondResponse = await recordRequest(workout.id, "82.5 kg x 5")
    expect(firstResponse.status).toBe(201)
    expect(secondResponse.status).toBe(201)
    const firstRecord = (await firstResponse.json()) as { id: number }
    const secondRecord = (await secondResponse.json()) as { id: number }
    expect(secondRecord.id).not.toBe(firstRecord.id)

    mocks.auth.mockResolvedValue({ userId: secondUser })
    const otherResponse = await recordRequest(workout.id, "60 kg x 5")
    const otherRecord = (await otherResponse.json()) as { id: number }

    mocks.auth.mockResolvedValue({ userId: firstUser })
    const firstHistory = (await (await getHistory(workout.id)).json()) as {
      records: Array<{ id: number }>
    }
    expect(firstHistory.records.map((record) => record.id)).toEqual([
      secondRecord.id,
      firstRecord.id,
    ])
    expect(firstHistory.records.map((record) => record.id)).not.toContain(
      otherRecord.id,
    )

    mocks.auth.mockResolvedValue({ userId: secondUser })
    const secondHistory = (await (await getHistory(workout.id)).json()) as {
      records: Array<{ id: number }>
    }
    expect(secondHistory.records.map((record) => record.id)).toEqual([
      otherRecord.id,
    ])
  })

  it("archives a referenced workout without losing its Session record", async () => {
    const { ownerId, program, workout } = await createFixture()
    mocks.auth.mockResolvedValue({ userId: ownerId })
    const savedResponse = await recordRequest(workout.id, "80 kg x 5")
    const savedRecord = (await savedResponse.json()) as { id: number }

    const deleteResponse = await deleteWorkout(
      new Request("http://localhost", { method: "DELETE" }),
      {
        params: Promise.resolve({
          id: String(program.id),
          workoutId: String(workout.id),
        }),
      },
    )

    expect(deleteResponse.status).toBe(200)
    await expect(deleteResponse.json()).resolves.toMatchObject({
      disposition: "archived",
    })
    const [persistedRecord] = await db
      .select({ id: sessionRecords.id })
      .from(sessionRecords)
      .where(eq(sessionRecords.id, savedRecord.id))
    expect(persistedRecord).toEqual({ id: savedRecord.id })
    expect((await getHistory(workout.id)).status).toBe(200)
    expect((await recordRequest(workout.id, "90 kg x 5")).status).toBe(404)
  })

  it("archives a referenced program without losing its Session record", async () => {
    const { ownerId, program, workout } = await createFixture()
    mocks.auth.mockResolvedValue({ userId: ownerId })
    const savedResponse = await recordRequest(workout.id, "80 kg x 5")
    const savedRecord = (await savedResponse.json()) as { id: number }

    const deleteResponse = await deleteProgram(
      new Request("http://localhost", { method: "DELETE" }),
      { params: Promise.resolve({ id: String(program.id) }) },
    )

    expect(deleteResponse.status).toBe(200)
    await expect(deleteResponse.json()).resolves.toMatchObject({
      disposition: "archived",
    })
    const [persistedRecord] = await db
      .select({ id: sessionRecords.id })
      .from(sessionRecords)
      .where(eq(sessionRecords.id, savedRecord.id))
    expect(persistedRecord).toEqual({ id: savedRecord.id })
    expect((await getHistory(workout.id)).status).toBe(200)
    expect((await recordRequest(workout.id, "90 kg x 5")).status).toBe(404)
  })
})
