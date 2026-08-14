import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  limit: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock(".", () => ({ db: { select: mocks.select } }))

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
