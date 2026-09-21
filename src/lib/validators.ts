import { z } from "zod"

export const providerNames = ["pushjerk", "linchpin"] as const

export const providerNameSchema = z.enum(providerNames)

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number)
    const date = new Date(Date.UTC(year!, month! - 1, day!))
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month! - 1 &&
      date.getUTCDate() === day
    )
  }, "Invalid calendar date")

export const createProgramSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
})

export const updateProgramSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
})

export const programExerciseSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(1000),
  recordPrompt: z
    .object({
      label: z.string().trim().min(1).max(255),
      placeholder: z.string().trim().min(1).max(255).optional(),
    })
    .optional(),
})

export const workoutSectionSchema = z.object({
  title: z.string().min(1),
  exercises: z
    .array(z.union([z.string().min(1), programExerciseSchema]))
    .min(1),
  videoUrl: z.string().url().nullable().optional(),
})

const workoutContentSchema = z
  .array(workoutSectionSchema)
  .min(1)
  .superRefine((sections, context) => {
    const exerciseIds = new Set<string>()

    sections.forEach((section, sectionIndex) => {
      section.exercises.forEach((exercise, exerciseIndex) => {
        if (typeof exercise === "string") return

        if (exerciseIds.has(exercise.id)) {
          context.addIssue({
            code: "custom",
            message: "Stable exercise IDs must be unique within a workout",
            path: [sectionIndex, "exercises", exerciseIndex, "id"],
          })
        }
        exerciseIds.add(exercise.id)
      })
    })
  })

export const createProgramWorkoutSchema = z.object({
  date: dateSchema,
  title: z.string().max(255).nullable().optional(),
  content: workoutContentSchema,
  videoUrl: z.string().url().nullable().optional(),
})

export const updateProgramWorkoutSchema = z.object({
  date: dateSchema.optional(),
  title: z.string().max(255).nullable().optional(),
  content: workoutContentSchema.optional(),
  videoUrl: z.string().url().nullable().optional(),
})

export const saveSessionRecordSchema = z.object({
  entries: z
    .array(
      z.object({
        fieldId: z.string().trim().min(1).max(100),
        value: z.string().trim().max(1000),
      }),
    )
    .min(1)
    .max(20),
})

export const unrestrictedSessionRecordSchema = z.object({
  performedOn: dateSchema,
  timezoneOffsetMinutes: z.number().int().min(-840).max(840).optional(),
  entries: z
    .array(
      z.object({
        fieldId: z.string().trim().min(1).max(100),
        value: z.string().trim().max(1000),
      }),
    )
    .max(50),
  note: z.string().trim().max(2000).nullable().optional(),
})
