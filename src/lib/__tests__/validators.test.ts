import { describe, expect, it } from "vitest"

import {
  createProgramSchema,
  createProgramWorkoutSchema,
  dateSchema,
  providerNameSchema,
  updateProgramSchema,
} from "../validators"

describe("providerNameSchema", () => {
  it("accepts valid provider names", () => {
    expect(providerNameSchema.parse("invictus")).toBe("invictus")
    expect(providerNameSchema.parse("pushjerk")).toBe("pushjerk")
    expect(providerNameSchema.parse("linchpin")).toBe("linchpin")
  })

  it("rejects invalid provider names", () => {
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

describe("createProgramWorkoutSchema", () => {
  it("accepts valid workout data", () => {
    const result = createProgramWorkoutSchema.parse({
      date: "2024-01-15",
      content: ["Line 1", "Line 2"],
    })
    expect(result.date).toBe("2024-01-15")
    expect(result.content).toEqual(["Line 1", "Line 2"])
  })

  it("accepts optional fields", () => {
    const result = createProgramWorkoutSchema.parse({
      date: "2024-01-15",
      title: "Day 1",
      content: ["Workout"],
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
        content: ["A"],
        videoUrl: "not-a-url",
      }),
    ).toThrow()
  })
})
