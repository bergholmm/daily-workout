import { describe, expect, it } from "vitest"

import { capitalize, getDateStr } from "../utils"

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello")
    expect(capitalize("invictus")).toBe("Invictus")
  })

  it("returns empty string for empty input", () => {
    expect(capitalize("")).toBe("")
  })

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A")
  })
})

describe("getDateStr", () => {
  it("formats date as YYYY-MM-DD", () => {
    const date = new Date(2024, 0, 15) // Jan 15, 2024
    expect(getDateStr(date)).toBe("2024-01-15")
  })

  it("pads month and day", () => {
    const date = new Date(2024, 2, 5) // Mar 5, 2024
    expect(getDateStr(date)).toBe("2024-03-05")
  })

  it("returns undefined for undefined input", () => {
    expect(getDateStr(undefined)).toBeUndefined()
  })
})
