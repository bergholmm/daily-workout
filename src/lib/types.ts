export type ProgramExercise = {
  id: string
  name: string
  youtubeSearch?: string | null
  recordPrompt?: {
    label: string
    placeholder?: string
  }
}

export type LegacyWorkoutSection = {
  title: string
  exercises: Array<string | ProgramExercise>
  videoUrl?: string | null
}

export type WorkoutMovement = {
  id: string
  name: string
  prescriptions: [string, string, string, string]
  notes?: string[]
  scaling?: string[]
}

export type StructuredWorkoutSection = {
  id: string
  kind:
    | "preparation"
    | "skill"
    | "main"
    | "conditioning"
    | "flexibility"
    | "decompression"
  title: string
  prescriptions?: [string, string, string, string]
  movements: WorkoutMovement[]
  notes?: string[]
}

export type SessionRecordField = {
  id: string
  label: string
  placeholder?: string
  previousFieldIds?: string[]
}

export type SessionRecordSection = {
  id: string
  kind: "record"
  title: string
  fields: SessionRecordField[]
}

export type WorkoutSection =
  | LegacyWorkoutSection
  | StructuredWorkoutSection
  | SessionRecordSection

export type ResolvedWorkoutMovement = Omit<WorkoutMovement, "prescriptions"> & {
  prescription: string
}

export type ResolvedWorkoutSection = Omit<
  StructuredWorkoutSection,
  "prescriptions" | "movements"
> & {
  prescription?: string
  movements: ResolvedWorkoutMovement[]
}

export type SessionRecordEntry = {
  fieldId: string
  label: string
  value: string
}

export type SessionRecord = {
  id: number
  programRunId: number | null
  workoutId: number
  weekNumber: number | null
  performedOn: string
  entries: SessionRecordEntry[]
  note: string | null
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
  phaseNumber: number | null
  weekNumber: number | null
  emphasisNumber: number | null
  durationMinutes: number | null
  focus: string[]
  equipment: string[]
}

export type ResolvedPublicProgramWorkout = Omit<
  PublicProgramWorkout,
  "content"
> & {
  content: Array<
    LegacyWorkoutSection | ResolvedWorkoutSection | SessionRecordSection
  >
}
