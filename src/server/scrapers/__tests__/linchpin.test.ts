import { readFileSync } from "fs"
import { resolve } from "path"
import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchLinchpinWorkout } from "../linchpin"
import { BREAK, ScraperError } from "../utils"

const fixturesDir = resolve(__dirname, "fixtures")

function mockFetch(html: string, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 404,
      text: () => Promise.resolve(html),
    }),
  )
}

describe("fetchLinchpinWorkout", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("parses workout from HTML fixture", async () => {
    const html = readFileSync(resolve(fixturesDir, "linchpin.html"), "utf-8")
    mockFetch(html)

    const result = await fetchLinchpinWorkout("2024-01-15")
    expect(result).toContain("Warm Up")
    expect(result).toContain("Thrusters (95/65)")
    expect(result.some((l) => l === BREAK)).toBe(true)
  })

  it("generates correct URL format (MM-DD-YYYY)", async () => {
    const html = readFileSync(resolve(fixturesDir, "linchpin.html"), "utf-8")
    mockFetch(html)

    await fetchLinchpinWorkout("2024-03-05")
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "https://crossfitlinchpin.com/blogs/wod/03-05-2024-workout-of-the-day",
    )
  })

  it("throws not_found for rest day", async () => {
    const html = readFileSync(
      resolve(fixturesDir, "linchpin-rest.html"),
      "utf-8",
    )
    mockFetch(html)

    await expect(fetchLinchpinWorkout("2024-01-14")).rejects.toThrow(
      ScraperError,
    )
    try {
      await fetchLinchpinWorkout("2024-01-14")
    } catch (err) {
      expect((err as ScraperError).type).toBe("not_found")
    }
  })

  it("throws parse error when no article found", async () => {
    const html = readFileSync(resolve(fixturesDir, "empty.html"), "utf-8")
    mockFetch(html)

    await expect(fetchLinchpinWorkout("2024-01-15")).rejects.toThrow(
      ScraperError,
    )
  })

  it("throws network error on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")))

    await expect(fetchLinchpinWorkout("2024-01-15")).rejects.toThrow(
      ScraperError,
    )
  })

  it("filters out ad text", async () => {
    const html = readFileSync(resolve(fixturesDir, "linchpin.html"), "utf-8")
    mockFetch(html)

    const result = await fetchLinchpinWorkout("2024-01-15")
    expect(result.some((l) => l.includes("Linchpin Private Track"))).toBe(false)
  })
})
