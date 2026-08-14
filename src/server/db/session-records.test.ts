import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  updateSet: vi.fn(),
  updateWhere: vi.fn(),
  insertValues: vi.fn(),
  insertReturning: vi.fn(),
}))

vi.mock(".", () => ({
  db: {
    select: mocks.select,
    update: mocks.update,
    insert: mocks.insert,
    delete: mocks.delete,
  },
}))

describe("program run history", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.select
      .mockReturnValueOnce({
        from: () => ({
          where: () => ({
            limit: () =>
              Promise.resolve([{ id: 4, programId: 8, status: "active" }]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: () => ({
          where: () => Promise.resolve([{ id: 31 }]),
        }),
      })
    mocks.updateWhere.mockResolvedValue(undefined)
    mocks.updateSet.mockReturnValue({ where: mocks.updateWhere })
    mocks.update.mockReturnValue({ set: mocks.updateSet })
    mocks.insertReturning.mockResolvedValue([
      { id: 5, programId: 8, status: "active" },
    ])
    mocks.insertValues.mockReturnValue({ returning: mocks.insertReturning })
    mocks.insert.mockReturnValue({ values: mocks.insertValues })
  })

  it("abandons the current run and starts a new run without deleting history", async () => {
    const { startNewProgramRun } = await import("./session-records")

    const newRun = await startNewProgramRun("user_123", 8)

    expect(mocks.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "abandoned" }),
    )
    expect(mocks.insertValues).toHaveBeenCalledWith({
      userId: "user_123",
      programId: 8,
    })
    expect(mocks.delete).not.toHaveBeenCalled()
    expect(newRun).toMatchObject({ id: 5, status: "active" })
  })
})
