import { describe, expect, it } from "vitest"

import {
  getDateInTimeZone,
  getWeekday,
  isTrainingDay,
  shiftDateString,
} from "../program-date"

describe("program date helpers", () => {
  it("uses the Stockholm calendar date", () => {
    expect(getDateInTimeZone(new Date("2026-07-13T22:30:00Z"))).toBe(
      "2026-07-14",
    )
  })

  it("shifts date strings without local timezone drift", () => {
    expect(shiftDateString("2026-07-31", 1)).toBe("2026-08-01")
    expect(shiftDateString("2026-07-01", -1)).toBe("2026-06-30")
  })

  it("identifies the four training weekdays", () => {
    expect(getWeekday("2026-07-13")).toBe(1)
    expect(isTrainingDay("2026-07-13")).toBe(true)
    expect(isTrainingDay("2026-07-14")).toBe(true)
    expect(isTrainingDay("2026-07-15")).toBe(false)
    expect(isTrainingDay("2026-07-16")).toBe(true)
    expect(isTrainingDay("2026-07-17")).toBe(true)
    expect(isTrainingDay("2026-07-18")).toBe(false)
  })
})
