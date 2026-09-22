import {
  hybridPplProgram,
  hybridPplWorkouts,
} from "../data/hybrid-ppl-program.mjs"

const expectedTitles = ["Push", "Easy Run", "Legs", "Pull", "Longer Easy Run"]
const expectedPromptCounts = [9, 3, 11, 9, 3]
const failures = []
const exerciseIds = []

function fail(message) {
  failures.push(message)
}

if (hybridPplProgram.durationWeeks !== null) {
  fail("Hybrid PPL must remain an ongoing program without a duration")
}
if (!hybridPplProgram.unrestrictedRecordsEnabled) {
  fail("Hybrid PPL must use unrestricted session history")
}
if (hybridPplWorkouts.length !== 5) {
  fail(`Expected 5 workout definitions; found ${hybridPplWorkouts.length}`)
}
if (
  JSON.stringify(hybridPplWorkouts.map((workout) => workout.title)) !==
  JSON.stringify(expectedTitles)
) {
  fail(
    "Workout definitions are not in the approved Push / Run / Legs / Pull / Run order",
  )
}

hybridPplWorkouts.forEach((workout, index) => {
  if (workout.position !== index + 1) {
    fail(`${workout.title} has an invalid sequence position`)
  }
  if (workout.durationMinutes < 25 || workout.durationMinutes > 70) {
    fail(`${workout.title} has an implausible duration target`)
  }

  let promptCount = 0
  for (const section of workout.content) {
    if (!Array.isArray(section.exercises) || section.exercises.length === 0) {
      fail(`${workout.title} / ${section.title} must contain instructions`)
      continue
    }

    for (const exercise of section.exercises) {
      if (typeof exercise === "string") continue
      exerciseIds.push(exercise.id)
      if (exercise.recordPrompt) promptCount += 1

      if (!exercise.id.startsWith("hybrid-ppl-")) {
        fail(`${workout.title} contains an unstable exercise ID`)
      }
      if (
        /Preparation|Decompression|Warm-up|Cool-down/.test(section.title) &&
        exercise.recordPrompt
      ) {
        fail(
          `${workout.title} records non-progression work in ${section.title}`,
        )
      }
    }
  }

  if (promptCount !== expectedPromptCounts[index]) {
    fail(
      `${workout.title} has ${promptCount} record prompts; expected ${expectedPromptCounts[index]}`,
    )
  }
})

if (new Set(exerciseIds).size !== exerciseIds.length) {
  fail("Exercise IDs must be unique across the program")
}

const visibleText = JSON.stringify(hybridPplWorkouts)
for (const required of [
  "Freestanding handstand kick-up",
  "Wall handstand push-up",
  "Weighted dip",
  "Face pull",
  "L-sit progression",
  "Weighted or paused pistol squat",
  "Weighted pull-up",
  "Reverse pec deck",
  "conversational effort",
  "same or better the next morning",
  "reduce the pump block",
]) {
  if (!visibleText.includes(required))
    fail(`Missing required thread: ${required}`)
}
if (/barbell squat|barbell deadlift/i.test(visibleText)) {
  fail("Hybrid PPL contains an excluded barbell squat or deadlift focus")
}
if (/youtu\.be|youtube\.com\/(watch|embed)/i.test(visibleText)) {
  fail("Hybrid PPL must not store fixed or embedded YouTube videos")
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"))
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      valid: true,
      program: hybridPplProgram.name,
      workoutDefinitions: hybridPplWorkouts.length,
      recordPrompts: expectedPromptCounts.reduce(
        (total, count) => total + count,
        0,
      ),
      exerciseIdentities: exerciseIds.length,
      sequence: expectedTitles,
    },
    null,
    2,
  ),
)
