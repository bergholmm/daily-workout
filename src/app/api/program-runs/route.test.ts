import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getPublicProgramBySlug: vi.fn(),
  startNewProgramRun: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))
vi.mock("@/server/db/programs", () => ({
  getPublicProgramBySlug: mocks.getPublicProgramBySlug,
}))
vi.mock("@/server/db/session-records", () => ({
  startNewProgramRun: mocks.startNewProgramRun,
}))

describe("/api/program-runs", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_123" })
    mocks.getPublicProgramBySlug.mockResolvedValue({
      id: 8,
      slug: "built-to-move",
    })
  })

  it("requires authentication", async () => {
    mocks.auth.mockResolvedValue({ userId: null })
    const { POST } = await import("./route")

    const response = await POST()

    expect(response.status).toBe(401)
    expect(mocks.startNewProgramRun).not.toHaveBeenCalled()
  })

  it("returns not found when Built to Move is unavailable", async () => {
    mocks.getPublicProgramBySlug.mockResolvedValue(null)
    const { POST } = await import("./route")

    const response = await POST()

    expect(response.status).toBe(404)
    expect(mocks.startNewProgramRun).not.toHaveBeenCalled()
  })

  it("starts a new personal program run", async () => {
    const run = { id: 4, programId: 8, status: "active" }
    mocks.startNewProgramRun.mockResolvedValue(run)
    const { POST } = await import("./route")

    const response = await POST()

    expect(response.status).toBe(201)
    expect(mocks.startNewProgramRun).toHaveBeenCalledWith("user_123", 8)
    await expect(response.json()).resolves.toEqual(run)
  })
})
