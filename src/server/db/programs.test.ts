import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  limit: vi.fn(),
  delete: vi.fn(),
  deleteReturning: vi.fn(),
  update: vi.fn(),
  updateReturning: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock(".", () => ({
  db: {
    select: mocks.select,
    delete: mocks.delete,
    update: mocks.update,
  },
}))

describe("public Built to Move workout lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.limit.mockResolvedValue([
      {
        id: 42,
        phaseNumber: 1,
        emphasisNumber: 2,
        title: "Handstand Line and Muscle-Up Base",
      },
    ])
    mocks.select.mockReturnValue({
      from: () => ({
        innerJoin: () => ({
          where: () => ({ limit: mocks.limit }),
        }),
      }),
    })
  })

  it("resolves all four weeks in a level through one workout definition", async () => {
    const { getVisiblePublicProgramWorkoutBySlot } = await import("./programs")

    const workouts = await Promise.all(
      [1, 2, 3, 4].map((weekNumber) =>
        getVisiblePublicProgramWorkoutBySlot("built-to-move", weekNumber, 2),
      ),
    )

    expect(workouts.map((workout) => workout?.id)).toEqual([42, 42, 42, 42])
    expect(mocks.limit).toHaveBeenCalledTimes(4)
  })
})

describe("history-preserving archival", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.select.mockReturnValue({
      from: () => ({
        innerJoin: () => ({ where: () => ({}) }),
        where: () => ({}),
      }),
    })
    mocks.delete.mockReturnValue({
      where: () => ({ returning: mocks.deleteReturning }),
    })
    mocks.update.mockReturnValue({
      set: () => ({
        where: () => ({ returning: mocks.updateReturning }),
      }),
    })
    mocks.deleteReturning.mockRejectedValue(
      Object.assign(new Error("foreign key violation"), { code: "23503" }),
    )
  })

  it("archives a program if a Session record races its deletion", async () => {
    mocks.updateReturning.mockResolvedValue([{ id: 8 }])
    const { deleteOrArchiveProgram } = await import("./programs")

    await expect(deleteOrArchiveProgram(8)).resolves.toMatchObject({
      item: { id: 8 },
      disposition: "archived",
    })
  })

  it("archives a workout if a Session record races its deletion", async () => {
    mocks.updateReturning.mockResolvedValue([{ id: 42 }])
    const { deleteOrArchiveProgramWorkout } = await import("./programs")

    await expect(deleteOrArchiveProgramWorkout(42)).resolves.toMatchObject({
      item: { id: 42 },
      disposition: "archived",
    })
  })
})
