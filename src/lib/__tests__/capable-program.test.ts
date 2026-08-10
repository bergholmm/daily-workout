import { describe, expect, it } from "vitest"

import {
  CAPABLE_PHASES,
  CAPABLE_SESSIONS,
  getCapablePhase,
  getCapableSession,
  getCapableWorkoutHref,
} from "../capable-program"

describe("CAPABLE program navigation", () => {
  it("defines three sessions and twelve weeks across three phases", () => {
    expect(CAPABLE_SESSIONS.map((session) => session.name)).toEqual([
      "Lower",
      "Upper",
      "Conditioning",
    ])
    expect(CAPABLE_PHASES.flatMap((phase) => phase.weeks)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
  })

  it("resolves session slugs and semantic workout links", () => {
    expect(getCapableSession("upper")?.number).toBe(2)
    expect(getCapableSession(3)?.slug).toBe("conditioning")
    expect(getCapableWorkoutHref(7, 1)).toBe("/training/7/lower")
  })

  it("resolves the phase for a week", () => {
    expect(getCapablePhase(1)?.name).toBe("Range & Control")
    expect(getCapablePhase(8)?.name).toBe("Strength Through Range")
    expect(getCapablePhase(12)?.name).toBe("Capacity & Expression")
    expect(getCapablePhase(13)).toBeUndefined()
  })
})
