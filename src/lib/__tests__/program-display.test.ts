import { describe, expect, it } from "vitest"

import { shouldShowWorkoutDate } from "../program-display"

describe("program display", () => {
  it("hides authoring dates for ongoing programs", () => {
    expect(shouldShowWorkoutDate(true)).toBe(false)
    expect(shouldShowWorkoutDate(false)).toBe(true)
  })
})
