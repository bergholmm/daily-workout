import type {
  PublicProgramWorkout,
  ResolvedPublicProgramWorkout,
  ResolvedWorkoutSection,
  SessionRecordEntry,
  SessionRecordField,
  StructuredWorkoutSection,
} from "@/lib/types"

export const BUILT_TO_MOVE_PROGRAM_SLUG = "built-to-move"

export const BUILT_TO_MOVE_EMPHASES = [
  { number: 1, slug: "lower", name: "Lower", order: "First" },
  { number: 2, slug: "upper", name: "Upper", order: "Second" },
  {
    number: 3,
    slug: "conditioning",
    name: "Conditioning",
    order: "Third",
  },
] as const

export const BUILT_TO_MOVE_LEVELS = [
  {
    number: 1,
    name: "Positions and Control",
    weeks: [1, 2, 3, 4],
    description:
      "Establish honest starting measures, controllable ranges, and repeatable skill positions.",
  },
  {
    number: 2,
    name: "Strength Through Range",
    weeks: [5, 6, 7, 8],
    description:
      "Add load, range, and connected skill work while keeping every earlier fallback.",
  },
  {
    number: 3,
    name: "Integration and Expression",
    weeks: [9, 10, 11, 12],
    description:
      "Use the strongest reliable movement levels and record meaningful benchmarks without forcing final skills.",
  },
] as const

export function getBuiltToMoveEmphasis(value: string | number) {
  return BUILT_TO_MOVE_EMPHASES.find(
    (emphasis) => emphasis.slug === value || emphasis.number === Number(value),
  )
}

export function getBuiltToMoveLevel(weekNumber: number) {
  return BUILT_TO_MOVE_LEVELS.find((level) =>
    level.weeks.some((week) => week === weekNumber),
  )
}

export function getBuiltToMoveDefinitionsForLevel(
  workouts: PublicProgramWorkout[],
  levelNumber: number,
) {
  return BUILT_TO_MOVE_EMPHASES.flatMap((emphasis) => {
    const workout = workouts.find(
      (item) =>
        item.phaseNumber === levelNumber &&
        item.emphasisNumber === emphasis.number,
    )
    return workout ? [workout] : []
  })
}

type RecordedSessionOccurrence = {
  workoutId: number
  weekNumber: number
}

export function buildBuiltToMoveProgress(
  workouts: PublicProgramWorkout[],
  records: RecordedSessionOccurrence[],
) {
  const recordedKeys = new Set(
    records.map((record) => `${record.workoutId}:${record.weekNumber}`),
  )
  const slots = Array.from({ length: 12 }, (_, index) => index + 1).flatMap(
    (weekNumber) => {
      const levelNumber = Math.ceil(weekNumber / 4)
      return BUILT_TO_MOVE_EMPHASES.flatMap((emphasis) => {
        const workout = workouts.find(
          (item) =>
            item.phaseNumber === levelNumber &&
            item.emphasisNumber === emphasis.number,
        )
        return workout
          ? [{ weekNumber, emphasisNumber: emphasis.number, workout }]
          : []
      })
    },
  )
  const completedKeys = new Set(
    slots
      .filter((slot) =>
        recordedKeys.has(`${slot.workout.id}:${slot.weekNumber}`),
      )
      .map((slot) => `${slot.workout.id}:${slot.weekNumber}`),
  )
  const weekCompletedCounts = Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => {
      const weekNumber = index + 1
      return [
        weekNumber,
        slots.filter(
          (slot) =>
            slot.weekNumber === weekNumber &&
            completedKeys.has(`${slot.workout.id}:${slot.weekNumber}`),
        ).length,
      ]
    }),
  ) as Record<number, number>
  const nextSlot = slots.find(
    (slot) => !completedKeys.has(`${slot.workout.id}:${slot.weekNumber}`),
  )

  return {
    slots,
    completedKeys,
    completedCount: completedKeys.size,
    weekCompletedCounts,
    nextSlot,
    isComplete: slots.length === 36 && completedKeys.size === 36,
  }
}

export function findPreviousSessionValue(
  field: SessionRecordField,
  entries: SessionRecordEntry[],
) {
  const relevantIds = new Set([field.id, ...(field.previousFieldIds ?? [])])
  return entries.find((entry) => relevantIds.has(entry.fieldId))?.value
}

export function selectBuiltToMoveView(
  requestedLevel: number | null,
  requestedWeek: number | null,
  recommendedWeek: number | null,
) {
  const selectedLevel =
    BUILT_TO_MOVE_LEVELS.find((level) => level.number === requestedLevel) ??
    BUILT_TO_MOVE_LEVELS.find(
      (level) =>
        recommendedWeek !== null &&
        level.weeks.some((week) => week === recommendedWeek),
    ) ??
    BUILT_TO_MOVE_LEVELS[0]
  const weekNumber =
    selectedLevel.weeks.find((week) => week === requestedWeek) ??
    selectedLevel.weeks.find((week) => week === recommendedWeek) ??
    selectedLevel.weeks[0]

  return {
    level: selectedLevel,
    levelNumber: selectedLevel.number,
    weekNumber,
  }
}

export function getBuiltToMoveWorkoutHref(
  weekNumber: number,
  emphasisNumber: number,
) {
  const emphasis = getBuiltToMoveEmphasis(emphasisNumber)
  return `/training/${weekNumber}/${emphasis?.slug ?? emphasisNumber}`
}

export function getMovementSearchUrl(movementName: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(movementName)}`
}

function isStructuredSection(
  section: PublicProgramWorkout["content"][number],
): section is StructuredWorkoutSection {
  return "movements" in section
}

export function getLocalWeekNumber(weekNumber: number) {
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 12) {
    throw new RangeError("Cycle week must be between 1 and 12")
  }

  return ((weekNumber - 1) % 4) + 1
}

export function resolveBuiltToMoveWorkout(
  workout: PublicProgramWorkout,
  weekNumber: number,
): ResolvedPublicProgramWorkout {
  const localWeekIndex = getLocalWeekNumber(weekNumber) - 1

  return {
    ...workout,
    content: workout.content.map((section) => {
      if (!isStructuredSection(section)) return section

      const resolved: ResolvedWorkoutSection = {
        id: section.id,
        kind: section.kind,
        title: section.title,
        movements: section.movements.map(({ prescriptions, ...movement }) => ({
          ...movement,
          prescription: prescriptions[localWeekIndex],
        })),
      }

      const prescription = section.prescriptions?.[localWeekIndex]
      if (prescription) resolved.prescription = prescription
      if (section.notes) resolved.notes = section.notes

      return resolved
    }),
  }
}
