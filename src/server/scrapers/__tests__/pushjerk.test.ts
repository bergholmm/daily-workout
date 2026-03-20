import { readFileSync } from "fs"
import { resolve } from "path"
import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchPushjerkWorkout } from "../pushjerk"
import { SEPARATOR, ScraperError } from "../utils"

const fixturesDir = resolve(__dirname, "fixtures")

function mockFetch(html: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    }),
  )
}

describe("fetchPushjerkWorkout", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("parses workout from HTML fixture", async () => {
    const html = readFileSync(resolve(fixturesDir, "pushjerk.html"), "utf-8")
    mockFetch(html)

    const result = await fetchPushjerkWorkout("2024-01-15")
    expect(result).toContain("EMOM 20")
    expect(result).toContain("400m Run")
    expect(result.some((l) => l === SEPARATOR)).toBe(true)
  })

  it("generates correct URL format (day-mon-d-yyyy)", async () => {
    const html = readFileSync(resolve(fixturesDir, "pushjerk.html"), "utf-8")
    mockFetch(html)

    // 2024-01-15 is a Monday
    await fetchPushjerkWorkout("2024-01-15")
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "https://pushjerk.com/mon-jan-15-2024/",
    )
  })

  it("throws not_found for 'nothing was found' page", async () => {
    const html = readFileSync(
      resolve(fixturesDir, "pushjerk-notfound.html"),
      "utf-8",
    )
    mockFetch(html)

    await expect(fetchPushjerkWorkout("2024-01-15")).rejects.toThrow(
      ScraperError,
    )
    try {
      await fetchPushjerkWorkout("2024-01-15")
    } catch (err) {
      expect((err as ScraperError).type).toBe("not_found")
    }
  })

  it("throws parse error when no content div found", async () => {
    const html = readFileSync(resolve(fixturesDir, "empty.html"), "utf-8")
    mockFetch(html)

    await expect(fetchPushjerkWorkout("2024-01-15")).rejects.toThrow(
      ScraperError,
    )
  })
})
