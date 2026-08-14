import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getVisiblePublicWorkoutForRecord: vi.fn(),
  getSessionRecord: vi.fn(),
  getPreviousSessionRecord: vi.fn(),
  saveSessionRecord: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))

vi.mock("@/server/db/session-records", () => ({
  getVisiblePublicWorkoutForRecord: mocks.getVisiblePublicWorkoutForRecord,
  getSessionRecord: mocks.getSessionRecord,
  getPreviousSessionRecord: mocks.getPreviousSessionRecord,
  saveSessionRecord: mocks.saveSessionRecord,
}))

const workout = {
  id: 42,
  programId: 8,
  phaseNumber: 1,
  emphasisNumber: 1,
  content: [
    {
      id: "strength",
      kind: "main",
      title: "Strength",
      movements: [],
    },
    {
      id: "record",
      kind: "record",
      title: "Record",
      fields: [
        { id: "pull-up", label: "Pull-up load and reps" },
        { id: "handstand", label: "Best controlled handstand hold" },
      ],
    },
  ],
}

const params = { params: Promise.resolve({ workoutId: "42" }) }

describe("/api/session-records/[workoutId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_123" })
    mocks.getVisiblePublicWorkoutForRecord.mockResolvedValue(workout)
    mocks.getPreviousSessionRecord.mockResolvedValue(null)
  })

  it("requires authentication", async () => {
    mocks.auth.mockResolvedValue({ userId: null })
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost?week=1"), params)

    expect(response.status).toBe(401)
    expect(mocks.getSessionRecord).not.toHaveBeenCalled()
  })

  it("returns only the signed-in user's record", async () => {
    const record = {
      id: 7,
      workoutId: 42,
      entries: [
        {
          fieldId: "pull-up",
          label: "Pull-up load and reps",
          value: "+10 kg × 5",
        },
      ],
      createdAt: new Date("2026-07-14T12:00:00Z"),
      updatedAt: new Date("2026-07-14T12:00:00Z"),
    }
    mocks.getSessionRecord.mockResolvedValue(record)
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost?week=1"), params)

    expect(response.status).toBe(200)
    expect(mocks.getSessionRecord).toHaveBeenCalledWith({
      userId: "user_123",
      programId: 8,
      workoutId: 42,
      weekNumber: 1,
    })
    expect(mocks.getPreviousSessionRecord).toHaveBeenCalledWith({
      userId: "user_123",
      programId: 8,
      emphasisNumber: 1,
      weekNumber: 1,
    })
    await expect(response.json()).resolves.toMatchObject({
      record: { id: 7, workoutId: 42 },
      previousRecord: null,
    })
  })

  it("returns the previous session values for guidance", async () => {
    mocks.getSessionRecord.mockResolvedValue(null)
    mocks.getPreviousSessionRecord.mockResolvedValue({
      id: 6,
      workoutId: 42,
      weekNumber: 2,
      entries: [
        {
          fieldId: "pull-up",
          label: "Pull-up load and reps",
          value: "+8 kg × 5",
        },
      ],
    })
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost?week=3"), params)

    await expect(response.json()).resolves.toMatchObject({
      record: null,
      previousRecord: {
        weekNumber: 2,
        entries: [{ fieldId: "pull-up", value: "+8 kg × 5" }],
      },
    })
  })

  it("looks up previous values across a level boundary by workout emphasis", async () => {
    mocks.getVisiblePublicWorkoutForRecord.mockResolvedValue({
      ...workout,
      id: 52,
      phaseNumber: 2,
    })
    mocks.getSessionRecord.mockResolvedValue(null)
    mocks.getPreviousSessionRecord.mockResolvedValue({
      id: 8,
      workoutId: 42,
      weekNumber: 4,
      entries: [],
    })
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost?week=5"), params)

    expect(response.status).toBe(200)
    expect(mocks.getPreviousSessionRecord).toHaveBeenCalledWith({
      userId: "user_123",
      programId: 8,
      emphasisNumber: 1,
      weekNumber: 5,
    })
    await expect(response.json()).resolves.toMatchObject({
      previousRecord: { weekNumber: 4, workoutId: 42 },
    })
  })

  it("rejects a week outside the workout level", async () => {
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost?week=5"), params)

    expect(response.status).toBe(400)
    expect(mocks.getSessionRecord).not.toHaveBeenCalled()
  })

  it("rejects entries that do not match the workout fields", async () => {
    const { PUT } = await import("./route")
    const response = await PUT(
      new Request("http://localhost?week=1", {
        method: "PUT",
        body: JSON.stringify({
          entries: [{ fieldId: "different-field", value: "100" }],
        }),
      }),
      params,
    )

    expect(response.status).toBe(400)
    expect(mocks.saveSessionRecord).not.toHaveBeenCalled()
  })

  it("upserts matching entries for the signed-in user", async () => {
    const entries = [
      { fieldId: "pull-up", value: "+10 kg × 5" },
      { fieldId: "handstand", value: "28 sec" },
    ]
    const savedEntries = [
      {
        fieldId: "pull-up",
        label: "Pull-up load and reps",
        value: "+10 kg × 5",
      },
      {
        fieldId: "handstand",
        label: "Best controlled handstand hold",
        value: "28 sec",
      },
    ]
    mocks.saveSessionRecord.mockResolvedValue({
      id: 7,
      workoutId: 42,
      entries: savedEntries,
      createdAt: new Date("2026-07-14T12:00:00Z"),
      updatedAt: new Date("2026-07-14T12:00:00Z"),
    })
    const { PUT } = await import("./route")
    const response = await PUT(
      new Request("http://localhost?week=1", {
        method: "PUT",
        body: JSON.stringify({ entries }),
      }),
      params,
    )

    expect(response.status).toBe(200)
    expect(mocks.saveSessionRecord).toHaveBeenCalledWith({
      userId: "user_123",
      programId: 8,
      workoutId: 42,
      weekNumber: 1,
      entries: savedEntries,
    })
  })
})
