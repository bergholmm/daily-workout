import type {
  ProgramExercise,
  SessionRecordField,
  WorkoutSection,
} from "./types"

export function isProgramExercise(
  exercise: string | ProgramExercise,
): exercise is ProgramExercise {
  return typeof exercise !== "string"
}

export function getExerciseName(exercise: string | ProgramExercise) {
  return isProgramExercise(exercise) ? exercise.name : exercise
}

export function getExerciseSearchUrl(name: string) {
  const [movementName] = name.split(" — ", 1)
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(movementName.trim())}`
}

export function ensureStableExercisePrompts(
  content: WorkoutSection[],
  createId: () => string = () => crypto.randomUUID(),
): WorkoutSection[] {
  return content.map((section) => {
    if (!("exercises" in section)) return section

    return {
      ...section,
      exercises: section.exercises.map((exercise) => {
        if (!isProgramExercise(exercise)) {
          return {
            id: createId(),
            name: exercise,
            recordPrompt: { label: exercise },
          }
        }

        return {
          ...exercise,
          recordPrompt: exercise.recordPrompt ?? { label: exercise.name },
        }
      }),
    }
  })
}

export function getRecordPrompts(
  content: WorkoutSection[],
): SessionRecordField[] {
  return content.flatMap((section) => {
    if (!("exercises" in section)) return []

    return section.exercises.flatMap((exercise) => {
      if (!isProgramExercise(exercise) || !exercise.recordPrompt) return []

      return [
        {
          id: exercise.id,
          label: exercise.recordPrompt.label,
          ...(exercise.recordPrompt.placeholder
            ? { placeholder: exercise.recordPrompt.placeholder }
            : {}),
        },
      ]
    })
  })
}
