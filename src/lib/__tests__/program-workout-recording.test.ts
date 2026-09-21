import { describe, expect, it } from "vitest"

import {
  ensureStableExercisePrompts,
  getRecordPrompts,
} from "../program-workout-recording"

describe("program workout recording", () => {
  it("gives every legacy exercise a stable default Record prompt", () => {
    const content = ensureStableExercisePrompts(
      [
        {
          title: "Main Session",
          exercises: ["Goblet squat (10 reps)", "Kettlebell swing (10 reps)"],
          videoUrl: "https://example.com/main",
        },
      ],
      (() => {
        const ids = ["squat", "swing"]
        return () => ids.shift()!
      })(),
    )

    expect(content).toEqual([
      {
        title: "Main Session",
        exercises: [
          {
            id: "squat",
            name: "Goblet squat (10 reps)",
            recordPrompt: { label: "Goblet squat (10 reps)" },
          },
          {
            id: "swing",
            name: "Kettlebell swing (10 reps)",
            recordPrompt: { label: "Kettlebell swing (10 reps)" },
          },
        ],
        videoUrl: "https://example.com/main",
      },
    ])
  })

  it("keeps stable identities and owner prompt overrides", () => {
    const content = ensureStableExercisePrompts(
      [
        {
          title: "Main Session",
          exercises: [
            {
              id: "swing",
              name: "Kettlebell swing (10 reps)",
              recordPrompt: { label: "Swing result" },
            },
            {
              id: "squat",
              name: "Goblet squat (10 reps)",
              recordPrompt: {
                label: "Squat load and completed reps",
                placeholder: "24 kg, 3 x 10",
              },
            },
          ],
        },
      ],
      () => "replacement",
    )

    expect(getRecordPrompts(content)).toEqual([
      {
        id: "swing",
        label: "Swing result",
      },
      {
        id: "squat",
        label: "Squat load and completed reps",
        placeholder: "24 kg, 3 x 10",
      },
    ])
  })
})
