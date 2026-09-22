import { describe, expect, it } from "vitest"

import {
  hybridPplProgram,
  hybridPplWorkouts,
} from "../../../data/hybrid-ppl-program.mjs"

type Exercise = {
  id: string
  name: string
  recordPrompt?: { label: string; placeholder?: string }
}

function exercises() {
  return hybridPplWorkouts.flatMap((workout) =>
    workout.content.flatMap((section) =>
      section.exercises.filter(
        (exercise): exercise is Exercise => typeof exercise !== "string",
      ),
    ),
  )
}

describe("Hybrid PPL program definition", () => {
  it("defines a separate ongoing program with five ordered workouts", () => {
    expect(hybridPplProgram).toMatchObject({
      name: "Hybrid PPL",
      slug: "hybrid-ppl",
      durationWeeks: null,
      unrestrictedRecordsEnabled: true,
    })
    expect(hybridPplWorkouts.map((workout) => workout.title)).toEqual([
      "Push",
      "Easy Run",
      "Legs",
      "Pull",
      "Longer Easy Run",
    ])
  })

  it("uses stable unique exercise identities", () => {
    const allExercises = exercises()
    const ids = allExercises.map((exercise) => exercise.id)

    expect(allExercises.length).toBeGreaterThan(35)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.startsWith("hybrid-ppl-"))).toBe(true)
  })

  it("records useful work but not preparation or decompression", () => {
    for (const workout of hybridPplWorkouts) {
      for (const section of workout.content) {
        const actualExercises = section.exercises.filter(
          (exercise): exercise is Exercise => typeof exercise !== "string",
        )
        if (/Preparation|Decompression|Warm-up|Cool-down/.test(section.title)) {
          expect(
            actualExercises.every((exercise) => !exercise.recordPrompt),
          ).toBe(true)
        }
      }
    }

    const promptsByWorkout = hybridPplWorkouts.map((workout) =>
      workout.content.flatMap((section) =>
        section.exercises.filter(
          (exercise): exercise is Exercise =>
            typeof exercise !== "string" && Boolean(exercise.recordPrompt),
        ),
      ),
    )
    expect(promptsByWorkout.map((prompts) => prompts.length)).toEqual([
      9, 3, 11, 9, 3,
    ])
  })

  it("keeps the agreed movement, pump, run, and safety rules visible", () => {
    const visibleText = JSON.stringify(hybridPplWorkouts)

    expect(visibleText).toContain("Weighted dip")
    expect(visibleText).toContain("Face pull")
    expect(visibleText).toContain("L-sit")
    expect(visibleText).toContain("Weighted or paused pistol")
    expect(visibleText).toContain("Reverse pec deck")
    expect(visibleText).toContain("conversational effort")
    expect(visibleText).toContain("same or better the next morning")
    expect(visibleText).toContain("reduce the pump block")
  })
})
