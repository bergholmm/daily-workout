import { NextRequest } from "next/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: null })),
}))

vi.mock("@/server/scrapers", () => ({
  ScraperError: class ScraperError extends Error {
    type: string

    constructor(message: string, type: string) {
      super(message)
      this.type = type
    }
  },
  getWorkout: vi.fn(async () => ({
    id: 1,
    date: "2024-03-05",
    providerName: "pushjerk",
    content: ["10 rounds", "5 pull-ups"],
    createdAt: "2024-03-05T00:00:00.000Z",
  })),
}))

describe("GET /api/workout", () => {
  it("returns the workout without requiring an authenticated user", async () => {
    const { GET } = await import("./route")

    const response = await GET(
      new NextRequest(
        "http://localhost/api/workout?providerName=pushjerk&date=2024-03-05",
      ),
    )

    await expect(response.json()).resolves.toMatchObject({
      date: "2024-03-05",
      providerName: "pushjerk",
      content: ["10 rounds", "5 pull-ups"],
    })
    expect(response.status).toBe(200)
  })
})
