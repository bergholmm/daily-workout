import { describe, expect, it } from "vitest"

import {
  createProgramSchema,
  createProgramWorkoutSchema,
  dateSchema,
  providerNameSchema,
  updateProgramSchema,
  updateProgramWorkoutSchema,
  workoutSectionSchema,
} from "../validators"

describe("providerNameSchema", () => {
  it("accepts valid provider names", () => {
    expect(providerNameSchema.parse("pushjerk")).toBe("pushjerk")
    expect(providerNameSchema.parse("linchpin")).toBe("linchpin")
  })

  it("rejects invalid provider names", () => {
    expect(() => providerNameSchema.parse("invictus")).toThrow()
    expect(() => providerNameSchema.parse("invalid")).toThrow()
    expect(() => providerNameSchema.parse("")).toThrow()
  })
})

describe("dateSchema", () => {
  it("accepts valid YYYY-MM-DD dates", () => {
    expect(dateSchema.parse("2024-01-15")).toBe("2024-01-15")
    expect(dateSchema.parse("2024-12-31")).toBe("2024-12-31")
  })

  it("rejects invalid date formats", () => {
    expect(() => dateSchema.parse("01-15-2024")).toThrow()
    expect(() => dateSchema.parse("2024/01/15")).toThrow()
    expect(() => dateSchema.parse("")).toThrow()
  })

  it("rejects a date that matches the format but not the calendar", () => {
    expect(() => dateSchema.parse("2026-02-30")).toThrow()
  })
})

describe("createProgramSchema", () => {
  it("accepts valid program data", () => {
    const result = createProgramSchema.parse({ name: "My Program" })
    expect(result.name).toBe("My Program")
  })

  it("accepts optional description", () => {
    const result = createProgramSchema.parse({
      name: "My Program",
      description: "A description",
    })
    expect(result.description).toBe("A description")
  })

  it("rejects empty name", () => {
    expect(() => createProgramSchema.parse({ name: "" })).toThrow()
  })
})

describe("updateProgramSchema", () => {
  it("accepts partial updates", () => {
    expect(updateProgramSchema.parse({ name: "New Name" })).toEqual({
      name: "New Name",
    })
    expect(updateProgramSchema.parse({ description: null })).toEqual({
      description: null,
    })
    expect(updateProgramSchema.parse({})).toEqual({})
  })
})

describe("workoutSectionSchema", () => {
  it("accepts a valid section", () => {
    const result = workoutSectionSchema.parse({
      title: "Movement Prep: [2-3 Sets]",
      exercises: ["Shinbox Extension (8 Reps)", "Dragon Lunge (10 Reps)"],
    })
    expect(result.title).toBe("Movement Prep: [2-3 Sets]")
    expect(result.exercises).toHaveLength(2)
  })

  it("accepts exercises with stable Record prompts", () => {
    const result = workoutSectionSchema.parse({
      title: "Main Session",
      exercises: [
        {
          id: "goblet-squat",
          name: "Goblet squat (10 reps)",
          recordPrompt: {
            label: "Squat load and completed reps",
            placeholder: "24 kg, 3 x 10",
          },
        },
      ],
    })

    expect(result.exercises[0]).toMatchObject({
      id: "goblet-squat",
      recordPrompt: { label: "Squat load and completed reps" },
    })
  })

  it("rejects empty title", () => {
    expect(() =>
      workoutSectionSchema.parse({ title: "", exercises: ["A"] }),
    ).toThrow()
  })

  it("rejects empty exercises array", () => {
    expect(() =>
      workoutSectionSchema.parse({ title: "Section", exercises: [] }),
    ).toThrow()
  })
})

describe("createProgramWorkoutSchema", () => {
  it("accepts valid workout data", () => {
    const result = createProgramWorkoutSchema.parse({
      date: "2024-01-15",
      content: [{ title: "Warm Up", exercises: ["Run 400m", "Stretch"] }],
    })
    expect(result.date).toBe("2024-01-15")
    expect(result.content).toHaveLength(1)
    expect(result.content[0].title).toBe("Warm Up")
  })

  it("accepts optional fields", () => {
    const result = createProgramWorkoutSchema.parse({
      date: "2024-01-15",
      title: "Day 1",
      content: [{ title: "Main", exercises: ["Squats"] }],
      videoUrl: "https://stream.mux.com/test.m3u8",
    })
    expect(result.title).toBe("Day 1")
    expect(result.videoUrl).toBe("https://stream.mux.com/test.m3u8")
  })

  it("rejects empty content array", () => {
    expect(() =>
      createProgramWorkoutSchema.parse({
        date: "2024-01-15",
        content: [],
      }),
    ).toThrow()
  })

  it("rejects invalid video URL", () => {
    expect(() =>
      createProgramWorkoutSchema.parse({
        date: "2024-01-15",
        content: [{ title: "A", exercises: ["B"] }],
        videoUrl: "not-a-url",
      }),
    ).toThrow()
  })

  it("rejects duplicate stable exercise IDs across sections", () => {
    const content = [
      {
        title: "Strength",
        exercises: [{ id: "squat", name: "Back squat" }],
      },
      {
        title: "Conditioning",
        exercises: [{ id: "squat", name: "Air squat" }],
      },
    ]

    expect(() =>
      createProgramWorkoutSchema.parse({ date: "2024-01-15", content }),
    ).toThrow(/unique/i)
    expect(() => updateProgramWorkoutSchema.parse({ content })).toThrow(
      /unique/i,
    )
  })
})
