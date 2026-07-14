export type WorkoutSection = {
  title: string
  exercises: string[]
  videoUrl?: string | null
}

export type TrainingRecordEntry = {
  prompt: string
  value: string
}

export type TrainingRecord = {
  id: number
  workoutId: number
  entries: TrainingRecordEntry[]
  createdAt: string
  updatedAt: string
}

export type ProgramWorkoutStatus = "draft" | "scheduled" | "published"

export type PublicProgramWorkout = {
  id: number
  programId: number
  date: string
  title: string | null
  summary: string | null
  content: WorkoutSection[]
  videoUrl: string | null
  status: ProgramWorkoutStatus
  publishAt: Date | null
  publicationKey: string | null
  weekNumber: number | null
  sessionNumber: number | null
  durationMinutes: number | null
  focus: string[]
  equipment: string[]
}
