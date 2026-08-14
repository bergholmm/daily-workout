import { describe, expect, it } from "vitest"

import {
  BUILT_TO_MOVE_EMPHASES,
  BUILT_TO_MOVE_LEVELS,
  BUILT_TO_MOVE_PROGRAM_SLUG,
  buildBuiltToMoveProgress,
  findPreviousSessionValue,
  getBuiltToMoveDefinitionsForLevel,
  getBuiltToMoveLevel,
  getBuiltToMoveWorkoutHref,
  getMovementSearchUrl,
  resolveBuiltToMoveWorkout,
  selectBuiltToMoveView,
} from "@/lib/built-to-move-program"
import type { PublicProgramWorkout } from "@/lib/types"

import {
  builtToMoveDefinitions,
  builtToMoveProgram,
} from "../../../data/built-to-move-program.mjs"

type DataMovement = {
  id: string
  prescriptions: string[]
  scaling?: string[]
}

type DataTrainingSection = {
  id: string
  kind: string
  prescriptions?: string[]
  movements: DataMovement[]
}

type DataRecordSection = {
  id: string
  kind: "record"
  fields: Array<{ id: string }>
}

type DataWorkout = {
  levelNumber: number
  emphasisNumber: number
  durationMinutes: number
  movementPatterns: string[]
  content: Array<DataTrainingSection | DataRecordSection>
}

const definitions = builtToMoveDefinitions as unknown as DataWorkout[]

function trainingSection(workout: DataWorkout, id: string) {
  const result = workout.content.find(
    (section): section is DataTrainingSection =>
      section.id === id && "movements" in section,
  )
  if (!result) throw new Error(`Missing training section: ${id}`)
  return result
}

function recordSection(workout: DataWorkout) {
  const result = workout.content.find(
    (section): section is DataRecordSection => section.kind === "record",
  )
  if (!result) throw new Error("Missing record section")
  return result
}

function sectionMovement(section: DataTrainingSection, id: string) {
  const result = section.movements.find((movement) => movement.id === id)
  if (!result) throw new Error(`Missing movement: ${id}`)
  return result
}

describe("Built to Move program definition", () => {
  it("navigates the self-paced cycle with Built to Move terms", () => {
    expect(BUILT_TO_MOVE_PROGRAM_SLUG).toBe("built-to-move")
    expect(BUILT_TO_MOVE_LEVELS.map((level) => level.name)).toEqual([
      "Positions and Control",
      "Strength Through Range",
      "Integration and Expression",
    ])
    expect(BUILT_TO_MOVE_EMPHASES.map((emphasis) => emphasis.name)).toEqual([
      "Lower",
      "Upper",
      "Conditioning",
    ])
    expect(getBuiltToMoveLevel(8)?.number).toBe(2)
    expect(getBuiltToMoveWorkoutHref(8, 2)).toBe("/training/8/upper")
    expect(getMovementSearchUrl("Wall handstand push-up")).toBe(
      "https://www.youtube.com/results?search_query=Wall%20handstand%20push-up",
    )
  })

  it("selects the recommended week while respecting an explicit level and week", () => {
    expect(selectBuiltToMoveView(null, null, 6)).toMatchObject({
      levelNumber: 2,
      weekNumber: 6,
    })
    expect(selectBuiltToMoveView(3, 11, 6)).toMatchObject({
      levelNumber: 3,
      weekNumber: 11,
    })
    expect(selectBuiltToMoveView(3, 4, 6)).toMatchObject({
      levelNumber: 3,
      weekNumber: 9,
    })
  })

  it("returns three ordered workout definitions for the selected level", () => {
    const workouts = [3, 1, 2].map((emphasisNumber, index) => ({
      id: index + 1,
      phaseNumber: 2,
      emphasisNumber,
    })) as PublicProgramWorkout[]

    expect(
      getBuiltToMoveDefinitionsForLevel(workouts, 2).map(
        (workout) => workout.emphasisNumber,
      ),
    ).toEqual([1, 2, 3])
  })

  it("finds relevant previous values when a record field changes between levels", () => {
    expect(
      findPreviousSessionValue(
        {
          id: "muscle-up",
          label: "Band and successful muscle-ups",
          previousFieldIds: ["transition"],
        },
        [
          {
            fieldId: "transition",
            label: "Muscle-up transition support",
            value: "Green band × 2",
          },
        ],
      ),
    ).toBe("Green band × 2")
  })

  it("tracks the current week, next workout, and all 36 session occurrences", () => {
    const workouts = Array.from({ length: 9 }, (_, index) => ({
      id: index + 1,
      phaseNumber: Math.floor(index / 3) + 1,
      emphasisNumber: (index % 3) + 1,
    })) as PublicProgramWorkout[]
    const records = Array.from({ length: 5 }, (_, index) => ({
      workoutId: index < 3 ? index + 1 : index - 2,
      weekNumber: index < 3 ? 1 : 2,
    }))

    const progress = buildBuiltToMoveProgress(workouts, records)

    expect(progress.slots).toHaveLength(36)
    expect(progress.completedCount).toBe(5)
    expect(progress.weekCompletedCounts[1]).toBe(3)
    expect(progress.weekCompletedCounts[2]).toBe(2)
    expect(progress.nextSlot).toMatchObject({
      weekNumber: 2,
      emphasisNumber: 3,
    })
    expect(progress.isComplete).toBe(false)

    const complete = buildBuiltToMoveProgress(
      workouts,
      progress.slots.map((slot) => ({
        workoutId: slot.workout.id,
        weekNumber: slot.weekNumber,
      })),
    )
    expect(complete.completedCount).toBe(36)
    expect(complete.nextSlot).toBeUndefined()
    expect(complete.isComplete).toBe(true)
  })

  it("defines one Lower, Upper, and Conditioning workout for each level", () => {
    expect(builtToMoveProgram).toMatchObject({
      name: "Built to Move",
      slug: "built-to-move",
      durationWeeks: 12,
    })
    expect(
      definitions.map(
        (workout) => `${workout.levelNumber}:${workout.emphasisNumber}`,
      ),
    ).toEqual(["1:1", "1:2", "1:3", "2:1", "2:2", "2:3", "3:1", "3:2", "3:3"])
  })

  it("defines the approved Level 1 prescriptions and records", () => {
    const [lower, upper, conditioning] = definitions
    const lowerStrength = trainingSection(lower, "lower-strength")
    const upperStrength = trainingSection(upper, "upper-main-strength")
    const conditioningRounds = trainingSection(
      conditioning,
      "conditioning-circuit-a",
    )
    const lowerRecord = recordSection(lower)

    expect(
      sectionMovement(lowerStrength, "double-kettlebell-front-squat")
        .prescriptions,
    ).toEqual([
      "6 reps with 3 good reps available",
      "7 reps at the same load",
      "6 reps with a small load increase",
      "6 reps at the Week 3 load",
    ])
    expect(
      sectionMovement(upperStrength, "wall-handstand-push-up").prescriptions,
    ).toEqual([
      "One clean set capped at 5, then 2 × 1–2",
      "4 × 2 at the established range",
      "4 × 2–3 at the same range; do not add a deficit yet",
      "One clean set capped at 6, then 2 × 2",
    ])
    expect(conditioningRounds.prescriptions).toEqual([
      "2 rounds; establish loads and keep effort at 6 out of 10",
      "3 rounds",
      "3 rounds; add load to the swing or carry, not both",
      "Repeat the Week 3 setup at the same or lower effort",
    ])
    expect(lowerRecord.fields.map((field) => field.id)).toEqual([
      "pistol-setting",
      "front-squat",
      "single-leg-rdl",
      "split-squat",
      "swing",
      "pancake",
      "right-knee-response",
      "notes",
    ])
  })

  it("progresses Level 2 through range without removing earlier fallbacks", () => {
    const [lower, upper, conditioning] = definitions.slice(3, 6)
    const pistol = sectionMovement(
      trainingSection(lower, "lower-control"),
      "pistol",
    )
    const muscleUp = sectionMovement(
      trainingSection(upper, "bar-muscle-up"),
      "bar-muscle-up-practice",
    )
    const halfGetUp = sectionMovement(
      trainingSection(conditioning, "conditioning-circuit-a"),
      "half-turkish-get-up",
    )

    expect(pistol.prescriptions).toEqual([
      "3/side with a 3-second lowering phase; use the Level 1 target if needed",
      "4/side at the same range",
      "3/side with a pause, lower target, or full range",
      "3/side at the best Week 7 setting",
    ])
    expect(pistol.scaling).toContain(
      "Use a full pistol only after 3 clean sets/side with a stable foot and no sharp knee pinch",
    )
    expect(muscleUp.prescriptions).toEqual([
      "3 rounds: 2 high pulls plus 1–2 band-assisted full muscle-ups",
      "Use the same assistance and add 1 clean assisted rep across the complete block",
      "Return to the Week 5 rep count and use a lighter band or higher pull target",
      "4–6 measured assisted singles at the best reliable setting",
    ])
    expect(recordSection(upper).fields).toContainEqual(
      expect.objectContaining({
        id: "muscle-up",
        previousFieldIds: ["transition"],
      }),
    )
    expect(recordSection(conditioning).fields).toContainEqual(
      expect.objectContaining({
        id: "circuit-loads",
        previousFieldIds: ["swing-carry-loads"],
      }),
    )
    expect(halfGetUp.prescriptions).toEqual([
      "2/side",
      "2/side",
      "2/side",
      "2/side",
    ])
    expect(pistol.scaling).toContain(
      "Keep the Level 1 target when full range is not controlled or the knee pinches",
    )
  })

  it("caps Level 3 expression work and keeps qualified fallbacks", () => {
    const [lower, upper, conditioning] = definitions.slice(6, 9)
    const pistol = sectionMovement(
      trainingSection(lower, "lower-control"),
      "pistol",
    )
    const muscleUp = sectionMovement(
      trainingSection(upper, "bar-muscle-up"),
      "bar-muscle-up-practice",
    )
    const kettlebellComplex = sectionMovement(
      trainingSection(conditioning, "conditioning-circuit-b"),
      "kettlebell-clean-front-squat",
    )
    const hspu = sectionMovement(
      trainingSection(upper, "upper-main-strength"),
      "wall-handstand-push-up",
    )

    expect(pistol.prescriptions).toEqual([
      "3/side at the strongest qualified variation",
      "4/side at the same setting",
      "3/side with a longer pause or light load",
      "3/side at the best Week 11 setting; record both sides",
    ])
    expect(pistol.scaling).toContain(
      "Add a pause or light load only after 3 clean full-range sets/side with a stable foot and no sharp knee pinch",
    )
    expect(muscleUp.prescriptions).toEqual([
      "4 clean assisted or unassisted singles at the best qualified setting",
      "5 clean singles at the same setting",
      "4–6 singles with less assistance or an unassisted small kip when qualified",
      "4–6 measured singles at the strongest reliable setting; stop after 2 misses",
    ])
    expect(muscleUp.scaling).toContain(
      "Use 3 rounds of 2 high pulls and 2 assisted transitions when a full rep is not qualified",
    )
    expect(muscleUp.scaling).toContain(
      "Use an unassisted rep only after a repeatable lower-chest high pull, a smooth assisted turnover, 5 controlled straight-bar dips, and no painful elbow or shoulder response",
    )
    expect(hspu.scaling).toContain(
      "Add a deficit only after 5 clean head-to-floor wall HSPUs",
    )
    expect(kettlebellComplex.scaling).toContain(
      "Use a dead-stop swing plus goblet squat when the clean is not reliable",
    )
  })

  it("keeps every cycle invariant through the public program definition", () => {
    const requiredPatterns = [
      "vertical push",
      "horizontal push",
      "vertical pull",
      "horizontal pull",
      "squat",
      "hinge",
      "one-leg work",
      "trunk control",
      "carry",
      "locomotion",
    ]

    for (const workout of definitions) {
      expect(workout.durationMinutes).toBeGreaterThanOrEqual(50)
      expect(workout.durationMinutes).toBeLessThanOrEqual(60)
      expect(
        workout.content.some((section) => section.kind === "decompression"),
      ).toBe(true)
      expect(
        workout.content.filter((section) => section.kind === "record"),
      ).toHaveLength(1)

      const movementSections = workout.content.filter(
        (section): section is DataTrainingSection => "movements" in section,
      )
      for (const section of movementSections) {
        for (const movement of section.movements) {
          expect(movement.prescriptions).toHaveLength(4)
        }
      }

      const fields = recordSection(workout).fields
      const fieldIds = fields.map((field) => field.id)
      expect(new Set(fieldIds).size).toBe(fieldIds.length)

      const text = JSON.stringify(workout)
      expect(text).not.toMatch(/barbell|chin-up|front[ -]lever/i)
      expect(text).not.toMatch(/youtube\.com\/(watch|embed)|youtu\.be/i)
    }

    for (const level of builtToMoveProgram.levels) {
      const workouts = definitions.filter(
        (workout) => workout.levelNumber === level.number,
      )
      const patterns = new Set(
        workouts.flatMap((workout) => workout.movementPatterns),
      )
      for (const pattern of requiredPatterns) {
        expect(
          patterns.has(pattern),
          `${level.name} is missing ${pattern}`,
        ).toBe(true)
      }

      const workoutText = workouts.map((workout) => JSON.stringify(workout))
      expect(
        workoutText.filter((text) => /handstand/i.test(text)),
      ).toHaveLength(2)
      expect(workoutText.filter((text) => /pull-up/i.test(text))).toHaveLength(
        2,
      )
      expect(workoutText.filter((text) => /pancake/i.test(text))).toHaveLength(
        2,
      )
      expect(workoutText[1]).toMatch(/handstand push-up/i)
      expect(workoutText[1]).toMatch(/bar muscle-up/i)
    }
  })

  it("resolves the exact prescription for the selected cycle week", () => {
    const workout: PublicProgramWorkout = {
      id: 42,
      programId: 8,
      date: "2026-01-05",
      title: "Strength Through Range",
      summary: null,
      content: [
        {
          id: "main-strength",
          kind: "main",
          title: "Main strength pair",
          movements: [
            {
              id: "weighted-pull-up",
              name: "Weighted pull-up",
              prescriptions: [
                "3 × 5",
                "3 × 6",
                "3 × 4 with more load",
                "One clean set, then 2 × 4",
              ],
              scaling: ["Use bodyweight pull-ups when added load is not ready"],
            },
          ],
        },
      ],
      videoUrl: null,
      status: "published",
      publishAt: null,
      publicationKey: "built-to-move:l02:s02",
      phaseNumber: 2,
      weekNumber: null,
      emphasisNumber: 2,
      durationMinutes: 58,
      focus: ["Pull-up strength"],
      equipment: ["Pull-up bar"],
    }

    const resolved = resolveBuiltToMoveWorkout(workout, 7)

    expect(resolved.content).toEqual([
      {
        id: "main-strength",
        kind: "main",
        title: "Main strength pair",
        movements: [
          {
            id: "weighted-pull-up",
            name: "Weighted pull-up",
            prescription: "3 × 4 with more load",
            scaling: ["Use bodyweight pull-ups when added load is not ready"],
          },
        ],
      },
    ])
  })
})
