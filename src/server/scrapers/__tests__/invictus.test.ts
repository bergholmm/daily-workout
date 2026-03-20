import { readFileSync } from "fs"
import { resolve } from "path"
import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchInvictusWorkout } from "../invictus"
import { SEPARATOR, ScraperError } from "../utils"

const fixturesDir = resolve(__dirname, "fixtures")

describe("fetchInvictusWorkout", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("parses workout from HTML fixture", async () => {
    const html = readFileSync(resolve(fixturesDir, "invictus.html"), "utf-8")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(html),
      }),
    )

    const result = await fetchInvictusWorkout("2024-01-15")
    expect(result).toContain("Back Squat")
    expect(result).toContain("Deadlifts (225/155)")
    expect(result.some((l) => l === SEPARATOR)).toBe(true)
  })

  it("generates correct URL with month name", async () => {
    const html = readFileSync(resolve(fixturesDir, "invictus.html"), "utf-8")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(html),
      }),
    )

    await fetchInvictusWorkout("2024-03-05")
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "https://www.crossfitinvictus.com/wod/march-5-2024-performance/",
    )
  })

  it("falls back to second URL when first fails", async () => {
    const html = readFileSync(resolve(fixturesDir, "invictus.html"), "utf-8")
    const emptyHtml = readFileSync(resolve(fixturesDir, "empty.html"), "utf-8")
    let callCount = 0
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(callCount === 1 ? emptyHtml : html),
        })
      }),
    )

    const result = await fetchInvictusWorkout("2024-01-15")
    expect(result).toContain("Back Squat")
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2)
  })

  it("throws not_found when both URLs fail", async () => {
    const emptyHtml = readFileSync(resolve(fixturesDir, "empty.html"), "utf-8")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(emptyHtml),
      }),
    )

    await expect(fetchInvictusWorkout("2024-01-15")).rejects.toThrow(
      ScraperError,
    )
  })
})
