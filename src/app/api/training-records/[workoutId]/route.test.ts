import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getVisiblePublicWorkoutForRecord: vi.fn(),
  getTrainingRecord: vi.fn(),
  saveTrainingRecord: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))

vi.mock("@/server/db/training-records", () => ({
  getVisiblePublicWorkoutForRecord: mocks.getVisiblePublicWorkoutForRecord,
  getTrainingRecord: mocks.getTrainingRecord,
  saveTrainingRecord: mocks.saveTrainingRecord,
}))

const workout = {
  id: 42,
  content: [
    { title: "Strength", exercises: ["Back squat — 5 reps"] },
    {
      title: "Record",
      exercises: ["Squat load and RPE", "Best controlled handstand hold"],
    },
  ],
}

const params = { params: Promise.resolve({ workoutId: "42" }) }

describe("/api/training-records/[workoutId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_123" })
    mocks.getVisiblePublicWorkoutForRecord.mockResolvedValue(workout)
  })

  it("requires authentication", async () => {
    mocks.auth.mockResolvedValue({ userId: null })
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost"), params)

    expect(response.status).toBe(401)
    expect(mocks.getTrainingRecord).not.toHaveBeenCalled()
  })

  it("returns only the signed-in user's record", async () => {
    const record = {
      id: 7,
      workoutId: 42,
      entries: [{ prompt: "Squat load and RPE", value: "80 kg @ 7" }],
      createdAt: new Date("2026-07-14T12:00:00Z"),
      updatedAt: new Date("2026-07-14T12:00:00Z"),
    }
    mocks.getTrainingRecord.mockResolvedValue(record)
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost"), params)

    expect(response.status).toBe(200)
    expect(mocks.getTrainingRecord).toHaveBeenCalledWith("user_123", 42)
    await expect(response.json()).resolves.toMatchObject({
      id: 7,
      workoutId: 42,
    })
  })

  it("rejects entries that do not match the workout prompts", async () => {
    const { PUT } = await import("./route")
    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          entries: [{ prompt: "Different prompt", value: "100" }],
        }),
      }),
      params,
    )

    expect(response.status).toBe(400)
    expect(mocks.saveTrainingRecord).not.toHaveBeenCalled()
  })

  it("upserts matching entries for the signed-in user", async () => {
    const entries = [
      { prompt: "Squat load and RPE", value: "80 kg @ 7" },
      { prompt: "Best controlled handstand hold", value: "28 sec" },
    ]
    mocks.saveTrainingRecord.mockResolvedValue({
      id: 7,
      workoutId: 42,
      entries,
      createdAt: new Date("2026-07-14T12:00:00Z"),
      updatedAt: new Date("2026-07-14T12:00:00Z"),
    })
    const { PUT } = await import("./route")
    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify({ entries }),
      }),
      params,
    )

    expect(response.status).toBe(200)
    expect(mocks.saveTrainingRecord).toHaveBeenCalledWith(
      "user_123",
      42,
      entries,
    )
  })
})
