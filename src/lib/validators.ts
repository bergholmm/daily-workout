import { z } from "zod"

export const providerNames = ["pushjerk", "linchpin"] as const

export const providerNameSchema = z.enum(providerNames)

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")

export const createProgramSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
})

export const updateProgramSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
})

export const workoutSectionSchema = z.object({
  title: z.string().min(1),
  exercises: z.array(z.string().min(1)).min(1),
  videoUrl: z.string().url().nullable().optional(),
})

export const createProgramWorkoutSchema = z.object({
  date: dateSchema,
  title: z.string().max(255).nullable().optional(),
  content: z.array(workoutSectionSchema).min(1),
  videoUrl: z.string().url().nullable().optional(),
})

export const updateProgramWorkoutSchema = z.object({
  date: dateSchema.optional(),
  title: z.string().max(255).nullable().optional(),
  content: z.array(workoutSectionSchema).min(1).optional(),
  videoUrl: z.string().url().nullable().optional(),
})

export const saveTrainingRecordSchema = z.object({
  entries: z
    .array(
      z.object({
        prompt: z.string().trim().min(1).max(255),
        value: z.string().trim().max(1000),
      }),
    )
    .min(1)
    .max(20),
})
