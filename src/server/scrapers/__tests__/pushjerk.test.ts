import { readFileSync } from "fs"
import { resolve } from "path"
import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchPushjerkWorkout } from "../pushjerk"
import { BREAK, SEPARATOR, ScraperError } from "../utils"

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
    expect(result).toContain("Warm-up")
    expect(result).toContain("Cool-down")
    expect(result.some((l) => l === SEPARATOR)).toBe(true)
  })

  it("preserves YouTube links as markdown", async () => {
    const html = readFileSync(resolve(fixturesDir, "pushjerk.html"), "utf-8")
    mockFetch(html)

    const result = await fetchPushjerkWorkout("2024-01-15")
    const joined = result.join("\n")
    expect(joined).toContain(
      "[Couch Stretch](https://www.youtube.com/watch?v=abc123)",
    )
    expect(joined).toContain(
      "[Double Unders](https://www.youtube.com/watch?v=def456)",
    )
  })

  it("only splits sections on bold headers, not every paragraph", async () => {
    const html = readFileSync(resolve(fixturesDir, "pushjerk.html"), "utf-8")
    mockFetch(html)

    const result = await fetchPushjerkWorkout("2024-01-15")

    // Split into sections by SEPARATOR
    const sections: string[][] = []
    let current: string[] = []
    for (const line of result) {
      if (line === SEPARATOR) {
        if (current.length) sections.push(current)
        current = []
      } else {
        current.push(line)
      }
    }
    if (current.length) sections.push(current)

    // Should have 4 sections: Warm-up, Conditioning 1, Conditioning 2, Cool-down
    expect(sections).toHaveLength(4)
    expect(sections[0]![0]).toBe("Warm-up")
    expect(sections[1]![0]).toBe("Conditioning (part 1)")
    // "Goal: 15 min." and "Rest 5 min..." should be in Conditioning 1
    expect(sections[1]!.join("\n")).toContain("Goal: 15 min.")
    expect(sections[1]!.join("\n")).toContain("Rest 5 min between workouts.")
    expect(sections[2]![0]).toBe("Conditioning (part 2)")
    // "Barbell starts from the ground." should be in Conditioning 2
    expect(sections[2]!.join("\n")).toContain("Barbell starts from the ground.")
    expect(sections[3]![0]).toBe("Cool-down")
  })

  it("inserts paragraph breaks between inner paragraphs", async () => {
    const html = readFileSync(resolve(fixturesDir, "pushjerk.html"), "utf-8")
    mockFetch(html)

    const result = await fetchPushjerkWorkout("2024-01-15")

    // BREAK should appear between paragraphs within sections
    expect(result).toContain(BREAK)

    // Warm-up section: "• Tabata Air Bike" then BREAK then "3 rounds:"
    const tabataIdx = result.indexOf("• Tabata Air Bike")
    const roundsIdx = result.indexOf("3 rounds:")
    expect(result[tabataIdx + 1]).toBe(BREAK)
    expect(result[tabataIdx + 2]).toBe("3 rounds:")
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
