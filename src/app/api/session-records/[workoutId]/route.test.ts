import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getVisiblePublicWorkoutForRecord: vi.fn(),
  getSessionRecord: vi.fn(),
  getPreviousSessionRecord: vi.fn(),
  saveSessionRecord: vi.fn(),
  getAccessibleWorkoutForRecord: vi.fn(),
  getAccessibleWorkoutForHistory: vi.fn(),
  listUnrestrictedSessionRecords: vi.fn(),
  createUnrestrictedSessionRecord: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))

vi.mock("@/server/db/session-records", () => ({
  getVisiblePublicWorkoutForRecord: mocks.getVisiblePublicWorkoutForRecord,
  getSessionRecord: mocks.getSessionRecord,
  getPreviousSessionRecord: mocks.getPreviousSessionRecord,
  saveSessionRecord: mocks.saveSessionRecord,
  getAccessibleWorkoutForRecord: mocks.getAccessibleWorkoutForRecord,
  getAccessibleWorkoutForHistory: mocks.getAccessibleWorkoutForHistory,
  listUnrestrictedSessionRecords: mocks.listUnrestrictedSessionRecords,
  createUnrestrictedSessionRecord: mocks.createUnrestrictedSessionRecord,
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

const unrestrictedWorkout = {
  id: 10,
  programId: 3,
  phaseNumber: null,
  emphasisNumber: null,
  archivedAt: null,
  programArchivedAt: null,
  content: [
    {
      title: "Main Session",
      exercises: [
        {
          id: "squat",
          name: "Goblet squat",
          recordPrompt: { label: "Squat result" },
        },
        {
          id: "swing",
          name: "Kettlebell swing",
          recordPrompt: { label: "Swing result" },
        },
      ],
    },
  ],
}

const unrestrictedParams = {
  params: Promise.resolve({ workoutId: "10" }),
}

describe("unrestricted Session records", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_123" })
    mocks.getAccessibleWorkoutForRecord.mockResolvedValue(unrestrictedWorkout)
    mocks.getAccessibleWorkoutForHistory.mockResolvedValue(unrestrictedWorkout)
  })

  it("returns private workout history and latest values by Record prompt", async () => {
    mocks.listUnrestrictedSessionRecords.mockResolvedValue([
      {
        id: 2,
        performedOn: "2026-09-21",
        entries: [
          { fieldId: "squat", label: "Old squat result", value: "24 kg" },
        ],
        note: null,
      },
      {
        id: 1,
        performedOn: "2026-09-14",
        entries: [{ fieldId: "swing", label: "Swing result", value: "16 kg" }],
        note: null,
      },
    ])
    const { GET } = await import("./route")

    const response = await GET(
      new Request("http://localhost/api/session-records/10"),
      unrestrictedParams,
    )

    expect(response.status).toBe(200)
    expect(mocks.listUnrestrictedSessionRecords).toHaveBeenCalledWith({
      userId: "user_123",
      workoutId: 10,
    })
    await expect(response.json()).resolves.toMatchObject({
      records: [
        {
          id: 2,
          entries: [{ fieldId: "squat", label: "Old squat result" }],
        },
        { id: 1 },
      ],
      latestValues: { squat: "24 kg", swing: "16 kg" },
    })
  })

  it("keeps history readable when the workout is archived", async () => {
    mocks.getAccessibleWorkoutForRecord.mockResolvedValue(null)
    mocks.getAccessibleWorkoutForHistory.mockResolvedValue({
      ...unrestrictedWorkout,
      archivedAt: new Date("2026-09-21"),
    })
    mocks.listUnrestrictedSessionRecords.mockResolvedValue([
      { id: 2, entries: [] },
    ])
    const { GET } = await import("./route")

    const response = await GET(
      new Request("http://localhost/api/session-records/10"),
      unrestrictedParams,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      records: [{ id: 2 }],
    })
  })

  it("creates a dated record from any non-empty subset of exercise results", async () => {
    mocks.createUnrestrictedSessionRecord.mockResolvedValue({
      id: 3,
      workoutId: 10,
      performedOn: "2026-09-20",
      entries: [{ fieldId: "squat", label: "Squat result", value: "24 kg" }],
      note: "Strong session",
    })
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [
            { fieldId: "squat", value: "24 kg" },
            { fieldId: "swing", value: "" },
          ],
          note: "Strong session",
        }),
      }),
      unrestrictedParams,
    )

    expect(response.status).toBe(201)
    expect(mocks.createUnrestrictedSessionRecord).toHaveBeenCalledWith({
      userId: "user_123",
      workoutId: 10,
      performedOn: "2026-09-20",
      entries: [{ fieldId: "squat", label: "Squat result", value: "24 kg" }],
      note: "Strong session",
    })
  })

  it("creates a note-only record", async () => {
    mocks.createUnrestrictedSessionRecord.mockResolvedValue({ id: 3 })
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [],
          note: "Easy technique session",
        }),
      }),
      unrestrictedParams,
    )

    expect(response.status).toBe(201)
    expect(mocks.createUnrestrictedSessionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: [],
        note: "Easy technique session",
      }),
    )
  })

  it("allows multiple records for the same workout and performed date", async () => {
    mocks.createUnrestrictedSessionRecord
      .mockResolvedValueOnce({ id: 3 })
      .mockResolvedValueOnce({ id: 4 })
    const { POST } = await import("./route")
    const body = JSON.stringify({
      performedOn: "2026-09-20",
      entries: [{ fieldId: "squat", value: "24 kg" }],
    })

    const first = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body,
      }),
      unrestrictedParams,
    )
    const second = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body,
      }),
      unrestrictedParams,
    )

    expect(first.status).toBe(201)
    expect(second.status).toBe(201)
    expect(mocks.createUnrestrictedSessionRecord).toHaveBeenCalledTimes(2)
  })

  it("rejects an empty record", async () => {
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [{ fieldId: "squat", value: "  " }],
          note: "  ",
        }),
      }),
      unrestrictedParams,
    )

    expect(response.status).toBe(400)
    expect(mocks.createUnrestrictedSessionRecord).not.toHaveBeenCalled()
  })

  it("rejects a future performed date", async () => {
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body: JSON.stringify({
          performedOn: "2999-01-01",
          entries: [{ fieldId: "squat", value: "24 kg" }],
        }),
      }),
      unrestrictedParams,
    )

    expect(response.status).toBe(400)
    expect(mocks.createUnrestrictedSessionRecord).not.toHaveBeenCalled()
  })

  it("rejects a Record prompt from another workout", async () => {
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [{ fieldId: "pull-up", value: "5 reps" }],
        }),
      }),
      unrestrictedParams,
    )

    expect(response.status).toBe(400)
    expect(mocks.createUnrestrictedSessionRecord).not.toHaveBeenCalled()
  })

  it("rejects duplicated Record prompt identifiers", async () => {
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [
            { fieldId: "squat", value: "24 kg" },
            { fieldId: "squat", value: "26 kg" },
          ],
        }),
      }),
      unrestrictedParams,
    )

    expect(response.status).toBe(400)
    expect(mocks.createUnrestrictedSessionRecord).not.toHaveBeenCalled()
  })

  it("rejects a new record when the workout is archived", async () => {
    mocks.getAccessibleWorkoutForRecord.mockResolvedValue(null)
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://localhost/api/session-records/10", {
        method: "POST",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [{ fieldId: "squat", value: "24 kg" }],
        }),
      }),
      unrestrictedParams,
    )

    expect(response.status).toBe(404)
    expect(mocks.createUnrestrictedSessionRecord).not.toHaveBeenCalled()
  })
})
