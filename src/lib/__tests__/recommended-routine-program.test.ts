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
      "Full Body",
    ])
  })

  it("lists the warm-up, pairs, core, pump tri-sets, then the ladders", () => {
    const [workout] = recommendedRoutineWorkouts

    expect(workout.content.map((section) => section.title)).toEqual([
      "Warm-up: [1 Set]",
      "Pair 1: [3 Sets · Rest 90s]",
      "Pair 2: [3 Sets · Rest 90s]",
      "Pair 3: [3 Sets · Rest 90s]",
      "Core Triplet: [3 Sets · Rest 60s]",
      "Tri-set 1: Upper Back [2-3 Sets · Rest 60s]",
      "Tri-set 2: Chest & Arms [2-3 Sets · Rest 60s]",
      "Progressions",
    ])
    expect(
      workout.content.map((section) =>
        exercisesIn(section)
          .filter((exercise) => exercise.recordPrompt)
          .map((exercise) => exercise.name),
      ),
    ).toEqual([
      [],
      ["Pull-up Progression (5-8 Reps)", "Squat Progression (5-8 Reps)"],
      ["Dip Progression (5-8 Reps)", "Hinge Progression (5-8 Reps)"],
      ["Row Progression (5-8 Reps)", "Push-up Progression (5-8 Reps)"],
      [
        "Anti-Extension Progression (8-12 Reps)",
        "Anti-Rotation Progression (8-12 Reps)",
        "Extension Progression (8-12 Reps)",
      ],
      [
        "Reverse Fly (12-20 Reps)",
        "Dumbbell Shrug (10-15 Reps)",
        "Lateral Raise (12-20 Reps)",
      ],
      [
        "Cable Fly (12-15 Reps)",
        "Cable Curl (10-15 Reps)",
        "Face Pull (15-20 Reps)",
      ],
      [],
    ])
  })

  it("keeps notes out of the training blocks, like MILE", () => {
    const [workout] = recommendedRoutineWorkouts
    const trainingBlocks = workout.content.slice(0, -1)

    for (const section of trainingBlocks) {
      expect(section.exercises.every((item) => typeof item !== "string")).toBe(
        true,
      )
    }
    for (const exercise of trainingBlocks.flatMap(exercisesIn)) {
      if (exercise.recordPrompt) {
        expect(exercise.recordPrompt.label).toBe(
          exercise.name.replace(/ \(.*\)$/, ""),
        )
      }
    }
  })

  it("keeps every exercise identity stable and unique", () => {
    const ids = recommendedRoutineWorkouts.flatMap((workout) =>
      workout.content.flatMap((section) =>
        exercisesIn(section).map((exercise) => exercise.id),
      ),
    )

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(
      expect.arrayContaining([
        "recommended-routine-pull-up",
        "recommended-routine-squat",
        "recommended-routine-dip",
        "recommended-routine-hinge",
        "recommended-routine-row",
        "recommended-routine-push-up",
        "recommended-routine-anti-extension",
        "recommended-routine-anti-rotation",
        "recommended-routine-extension",
      ]),
    )
  })

  it("lists the progression rule and one ladder per exercise at the end", () => {
    const progressions = recommendedRoutineWorkouts[0].content.at(-1)!

    expect(progressions.exercises).toHaveLength(11)
    expect(progressions.exercises[0]).toContain("At 3 × 8")
    expect(progressions.exercises[1]).toContain("Tri-sets: stop 1-2 reps")
    expect(progressions.exercises[2]).toBe(
      "Pull-up: Scapular Pulls → Arch Hangs → Negatives → Pull-ups → Weighted",
    )
  })
})
