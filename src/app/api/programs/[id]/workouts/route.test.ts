import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getAccessibleProgram: vi.fn(),
  getProgramForOwner: vi.fn(),
  listProgramWorkouts: vi.fn(),
  createProgramWorkout: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))
vi.mock("@/server/db/programs", () => ({
  getAccessibleProgram: mocks.getAccessibleProgram,
  getProgramForOwner: mocks.getProgramForOwner,
  listProgramWorkouts: mocks.listProgramWorkouts,
  createProgramWorkout: mocks.createProgramWorkout,
}))

const params = { params: Promise.resolve({ id: "3" }) }

describe("/api/programs/[id]/workouts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_reader" })
  })

  it("lets a signed-in user read workouts from an accessible program", async () => {
    mocks.getAccessibleProgram.mockResolvedValue({
      id: 3,
      createdBy: "user_owner",
      isShared: true,
    })
    mocks.listProgramWorkouts.mockResolvedValue([{ id: 10, programId: 3 }])
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost"), params)

    expect(response.status).toBe(200)
    expect(mocks.listProgramWorkouts).toHaveBeenCalledWith({
      programId: 3,
      userId: "user_reader",
      canEdit: false,
      programArchived: false,
    })
    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({ id: 10, canEdit: false }),
    ])
  })

  it("does not let a non-owner create a workout", async () => {
    mocks.getProgramForOwner.mockResolvedValue(null)
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          date: "2026-09-21",
          title: "Workout",
          content: [{ title: "Main", exercises: ["Squat"] }],
        }),
      }),
      params,
    )

    expect(response.status).toBe(404)
    expect(mocks.createProgramWorkout).not.toHaveBeenCalled()
  })
})
