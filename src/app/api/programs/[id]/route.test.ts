import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getAccessibleProgram: vi.fn(),
  getProgramForOwner: vi.fn(),
  updateProgram: vi.fn(),
  deleteOrArchiveProgram: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))
vi.mock("@/server/db/programs", () => ({
  getAccessibleProgram: mocks.getAccessibleProgram,
  getProgramForOwner: mocks.getProgramForOwner,
  updateProgram: mocks.updateProgram,
  deleteOrArchiveProgram: mocks.deleteOrArchiveProgram,
}))

const params = { params: Promise.resolve({ id: "3" }) }

describe("/api/programs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user_reader" })
  })

  it("rejects anonymous access", async () => {
    mocks.auth.mockResolvedValue({ userId: null })
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost"), params)

    expect(response.status).toBe(401)
    expect(mocks.getAccessibleProgram).not.toHaveBeenCalled()
  })

  it("lets a signed-in user read an accessible program without edit access", async () => {
    mocks.getAccessibleProgram.mockResolvedValue({
      id: 3,
      name: "MILE",
      createdBy: "user_owner",
      isShared: true,
    })
    const { GET } = await import("./route")

    const response = await GET(new Request("http://localhost"), params)

    expect(mocks.getAccessibleProgram).toHaveBeenCalledWith(3, "user_reader")
    await expect(response.json()).resolves.toMatchObject({
      id: 3,
      name: "MILE",
      canEdit: false,
    })
  })

  it("does not let a non-owner update the program", async () => {
    mocks.getProgramForOwner.mockResolvedValue(null)
    const { PATCH } = await import("./route")

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ name: "Changed" }),
      }),
      params,
    )

    expect(response.status).toBe(404)
    expect(mocks.updateProgram).not.toHaveBeenCalled()
  })

  it("lets the owner update the program", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_owner" })
    mocks.getProgramForOwner.mockResolvedValue({ id: 3 })
    mocks.updateProgram.mockResolvedValue({
      id: 3,
      name: "MILE Updated",
      createdBy: "user_owner",
    })
    const { PATCH } = await import("./route")

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ name: "MILE Updated" }),
      }),
      params,
    )

    expect(response.status).toBe(200)
    expect(mocks.updateProgram).toHaveBeenCalledWith(3, {
      name: "MILE Updated",
    })
  })

  it("archives an owned program when its history must be preserved", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_owner" })
    mocks.getProgramForOwner.mockResolvedValue({ id: 3 })
    mocks.deleteOrArchiveProgram.mockResolvedValue({
      item: { id: 3, archivedAt: new Date("2026-09-21") },
      disposition: "archived",
    })
    const { DELETE } = await import("./route")

    const response = await DELETE(new Request("http://localhost"), params)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      id: 3,
      disposition: "archived",
    })
  })

  it("permanently deletes an owned program without history", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_owner" })
    mocks.getProgramForOwner.mockResolvedValue({ id: 3 })
    mocks.deleteOrArchiveProgram.mockResolvedValue({
      item: { id: 3 },
      disposition: "deleted",
    })
    const { DELETE } = await import("./route")

    const response = await DELETE(new Request("http://localhost"), params)

    await expect(response.json()).resolves.toMatchObject({
      id: 3,
      disposition: "deleted",
    })
  })

  it("does not let a non-owner archive or delete a program", async () => {
    mocks.getProgramForOwner.mockResolvedValue(null)
    const { DELETE } = await import("./route")

    const response = await DELETE(new Request("http://localhost"), params)

    expect(response.status).toBe(404)
    expect(mocks.deleteOrArchiveProgram).not.toHaveBeenCalled()
  })
})
