import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getAccessibleWorkoutForHistory: vi.fn(),
  getUnrestrictedSessionRecord: vi.fn(),
  updateUnrestrictedSessionRecord: vi.fn(),
  deleteUnrestrictedSessionRecord: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))
vi.mock("@/server/db/session-records", () => ({
  getAccessibleWorkoutForHistory: mocks.getAccessibleWorkoutForHistory,
  getUnrestrictedSessionRecord: mocks.getUnrestrictedSessionRecord,
  updateUnrestrictedSessionRecord: mocks.updateUnrestrictedSessionRecord,
  deleteUnrestrictedSessionRecord: mocks.deleteUnrestrictedSessionRecord,
}))

const workout = {
  id: 10,
  programId: 3,
  content: [
    {
      title: "Main",
      exercises: [
        {
          id: "squat",
          name: "Goblet squat",
          recordPrompt: { label: "Current squat result" },
        },
      ],
    },
  ],
}

const params = {
  params: Promise.resolve({ workoutId: "10", recordId: "7" }),
}

describe("/api/session-records/[workoutId]/[recordId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_123" })
    mocks.getAccessibleWorkoutForHistory.mockResolvedValue(workout)
    mocks.getUnrestrictedSessionRecord.mockResolvedValue({
      id: 7,
      workoutId: 10,
      performedOn: "2026-09-20",
      entries: [
        {
          fieldId: "squat",
          label: "Old squat result",
          value: "24 kg",
        },
      ],
      note: null,
    })
  })

  it("updates an owned Session record without rewriting its saved prompt label", async () => {
    mocks.updateUnrestrictedSessionRecord.mockResolvedValue({
      id: 7,
      workoutId: 10,
      performedOn: "2026-09-20",
      entries: [
        {
          fieldId: "squat",
          label: "Old squat result",
          value: "28 kg",
        },
      ],
      note: null,
    })
    const { PATCH } = await import("./route")

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [{ fieldId: "squat", value: "28 kg" }],
          note: null,
        }),
      }),
      params,
    )

    expect(response.status).toBe(200)
    expect(mocks.updateUnrestrictedSessionRecord).toHaveBeenCalledWith({
      id: 7,
      userId: "user_123",
      workoutId: 10,
      performedOn: "2026-09-20",
      entries: [
        {
          fieldId: "squat",
          label: "Old squat result",
          value: "28 kg",
        },
      ],
      note: null,
    })
  })

  it("does not reveal a record owned by another user", async () => {
    mocks.deleteUnrestrictedSessionRecord.mockResolvedValue(null)
    const { DELETE } = await import("./route")

    const response = await DELETE(new Request("http://localhost"), params)

    expect(response.status).toBe(404)
    expect(mocks.deleteUnrestrictedSessionRecord).toHaveBeenCalledWith({
      id: 7,
      userId: "user_123",
      workoutId: 10,
    })
  })

  it("deletes an owned Session record", async () => {
    mocks.deleteUnrestrictedSessionRecord.mockResolvedValue({ id: 7 })
    const { DELETE } = await import("./route")

    const response = await DELETE(new Request("http://localhost"), params)

    expect(response.status).toBe(200)
    expect(mocks.deleteUnrestrictedSessionRecord).toHaveBeenCalledWith({
      id: 7,
      userId: "user_123",
      workoutId: 10,
    })
  })

  it("rejects an edit with no exercise answer or note", async () => {
    const { PATCH } = await import("./route")

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [{ fieldId: "squat", value: "  " }],
          note: " ",
        }),
      }),
      params,
    )

    expect(response.status).toBe(400)
    expect(mocks.updateUnrestrictedSessionRecord).not.toHaveBeenCalled()
  })

  it("preserves a retired Record prompt while editing its historical record", async () => {
    mocks.getUnrestrictedSessionRecord.mockResolvedValue({
      id: 7,
      workoutId: 10,
      performedOn: "2026-09-20",
      entries: [
        {
          fieldId: "removed-exercise",
          label: "Retired exercise result",
          value: "5 reps",
        },
      ],
      note: null,
    })
    mocks.updateUnrestrictedSessionRecord.mockResolvedValue({ id: 7 })
    const { PATCH } = await import("./route")

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          performedOn: "2026-09-20",
          entries: [{ fieldId: "removed-exercise", value: "5 reps" }],
        }),
      }),
      params,
    )

    expect(response.status).toBe(200)
    expect(mocks.updateUnrestrictedSessionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: [
          {
            fieldId: "removed-exercise",
            label: "Retired exercise result",
            value: "5 reps",
          },
        ],
      }),
    )
  })
})
