import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  listPrograms: vi.fn(),
  createProgram: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))
vi.mock("@/server/db/programs", () => ({
  listPrograms: mocks.listPrograms,
  createProgram: mocks.createProgram,
}))

describe("/api/programs", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_reader" })
  })

  it("lists shared programs for a signed-in non-owner without edit access", async () => {
    mocks.listPrograms.mockResolvedValue([
      {
        id: 3,
        name: "MILE",
        createdBy: "user_owner",
        isShared: true,
        archivedAt: null,
      },
    ])
    const { GET } = await import("./route")

    const response = await GET()

    expect(response.status).toBe(200)
    expect(mocks.listPrograms).toHaveBeenCalledWith("user_reader")
    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({ id: 3, name: "MILE", canEdit: false }),
    ])
  })

  it("rejects anonymous program listing", async () => {
    mocks.auth.mockResolvedValue({ userId: null })
    const { GET } = await import("./route")

    const response = await GET()

    expect(response.status).toBe(401)
    expect(mocks.listPrograms).not.toHaveBeenCalled()
  })
})
