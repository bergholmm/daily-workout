import { describe, expect, it } from "vitest"

import {
  recommendedRoutineProgram,
  recommendedRoutineWorkouts,
} from "../../../data/recommended-routine-program.mjs"

type Exercise = {
  id: string
  name: string
  recordPrompt?: { label: string; placeholder?: string }
}

function exercisesIn(section: { exercises: Array<string | Exercise> }) {
  return section.exercises.filter(
    (exercise): exercise is Exercise => typeof exercise !== "string",
  )
}

describe("Recommended Routine program definition", () => {
  it("defines an ongoing program with one full-body workout", () => {
    expect(recommendedRoutineProgram).toMatchObject({
      name: "Recommended Routine",
      slug: "recommended-routine",
      durationWeeks: null,
      unrestrictedRecordsEnabled: true,
    })
    expect(recommendedRoutineWorkouts.map((workout) => workout.title)).toEqual([
      "Recommended Routine",
    ])
  })

  it("orders the warm-up, three pairs, and the core triplet", () => {
    const [workout] = recommendedRoutineWorkouts
    const recorded = workout.content.map((section) =>
      exercisesIn(section)
        .filter((exercise) => exercise.recordPrompt)
        .map((exercise) => exercise.name.split(" — ")[0]),
    )

    expect(workout.content.map((section) => section.title)).toEqual([
      "Warm-up — 5–10 minutes",
      "First pair — 3 rounds",
      "Second pair — 3 rounds",
      "Third pair — 3 rounds",
      "Core triplet — 3 rounds",
      "Session rules",
    ])
    expect(recorded).toEqual([
      [],
      ["Pull-up progression", "Squat progression"],
      ["Dip progression", "Hinge progression"],
      ["Row progression", "Push-up progression"],
      [
        "Anti-extension progression",
        "Anti-rotation progression",
        "Extension progression",
      ],
      [],
    ])
  })

  it("uses stable unique exercise identities", () => {
    const ids = recommendedRoutineWorkouts.flatMap((workout) =>
      workout.content.flatMap((section) =>
        exercisesIn(section).map((exercise) => exercise.id),
      ),
    )

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.startsWith("recommended-routine-"))).toBe(true)
  })

  it("keeps the set, rest, and progression rules visible", () => {
    const visibleText = JSON.stringify(recommendedRoutineWorkouts)

    expect(visibleText).toContain("3 × 5–8")
    expect(visibleText).toContain("3 × 8–12")
    expect(visibleText).toContain("Rest 90 seconds")
    expect(visibleText).toContain("Rest 60 seconds")
    expect(visibleText).toContain("Scapular pulls → Arch hangs")
    expect(visibleText).toContain("Plank → Ring ab rollouts")
    expect(visibleText).toContain("move to the next step at 3 × 5")
  })
})
