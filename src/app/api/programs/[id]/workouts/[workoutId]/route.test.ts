import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getProgramForOwner: vi.fn(),
  getProgramWorkout: vi.fn(),
  updateProgramWorkout: vi.fn(),
  deleteOrArchiveProgramWorkout: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))
vi.mock("@/server/db/programs", () => ({
  getProgramForOwner: mocks.getProgramForOwner,
  getProgramWorkout: mocks.getProgramWorkout,
  updateProgramWorkout: mocks.updateProgramWorkout,
  deleteOrArchiveProgramWorkout: mocks.deleteOrArchiveProgramWorkout,
}))

const params = {
  params: Promise.resolve({ id: "3", workoutId: "10" }),
}

describe("/api/programs/[id]/workouts/[workoutId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_reader" })
  })

  it("does not let a non-owner update a workout", async () => {
    mocks.getProgramForOwner.mockResolvedValue(null)
    const { PATCH } = await import("./route")

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ title: "Changed" }),
      }),
      params,
    )

    expect(response.status).toBe(404)
    expect(mocks.updateProgramWorkout).not.toHaveBeenCalled()
  })

  it("does not update a workout through the wrong parent program", async () => {
    mocks.getProgramForOwner.mockResolvedValue({ id: 3 })
    mocks.getProgramWorkout.mockResolvedValue(null)
    const { PATCH } = await import("./route")

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ title: "Changed" }),
      }),
      params,
    )

    expect(response.status).toBe(404)
    expect(mocks.updateProgramWorkout).not.toHaveBeenCalled()
  })

  it("rejects duplicate stable exercise IDs", async () => {
    mocks.getProgramForOwner.mockResolvedValue({ id: 3 })
    mocks.getProgramWorkout.mockResolvedValue({ id: 10, programId: 3 })
    const { PATCH } = await import("./route")

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          content: [
            {
              title: "Strength",
              exercises: [{ id: "squat", name: "Back squat" }],
            },
            {
              title: "Conditioning",
              exercises: [{ id: "squat", name: "Air squat" }],
            },
          ],
        }),
      }),
      params,
    )

    expect(response.status).toBe(400)
    expect(mocks.updateProgramWorkout).not.toHaveBeenCalled()
  })

  it("archives an owned workout when its history must be preserved", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_owner" })
    mocks.getProgramForOwner.mockResolvedValue({ id: 3 })
    mocks.getProgramWorkout.mockResolvedValue({ id: 10, programId: 3 })
    mocks.deleteOrArchiveProgramWorkout.mockResolvedValue({
      item: { id: 10, archivedAt: new Date("2026-09-21") },
      disposition: "archived",
    })
    const { DELETE } = await import("./route")

    const response = await DELETE(new Request("http://localhost"), params)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      id: 10,
      disposition: "archived",
    })
  })

  it("permanently deletes an owned workout without history", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_owner" })
    mocks.getProgramForOwner.mockResolvedValue({ id: 3 })
    mocks.getProgramWorkout.mockResolvedValue({ id: 10, programId: 3 })
    mocks.deleteOrArchiveProgramWorkout.mockResolvedValue({
      item: { id: 10 },
      disposition: "deleted",
    })
    const { DELETE } = await import("./route")

    const response = await DELETE(new Request("http://localhost"), params)

    await expect(response.json()).resolves.toMatchObject({
      id: 10,
      disposition: "deleted",
    })
  })

  it("does not let a non-owner archive or delete a workout", async () => {
    mocks.getProgramForOwner.mockResolvedValue(null)
    const { DELETE } = await import("./route")

    const response = await DELETE(new Request("http://localhost"), params)

    expect(response.status).toBe(404)
    expect(mocks.deleteOrArchiveProgramWorkout).not.toHaveBeenCalled()
  })
})
