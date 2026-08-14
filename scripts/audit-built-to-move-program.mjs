import {
  builtToMoveDefinitions,
  builtToMoveProgram,
} from "../data/built-to-move-program.mjs"

const requiredPatterns = [
  "vertical push",
  "horizontal push",
  "vertical pull",
  "horizontal pull",
  "squat",
  "hinge",
  "one-leg work",
  "trunk control",
  "carry",
  "locomotion",
]

const failures = []
const fail = (message) => failures.push(message)

if (builtToMoveDefinitions.length !== 9) {
  fail(`Expected 9 workout definitions; found ${builtToMoveDefinitions.length}`)
}

const slots = new Set()
for (const workout of builtToMoveDefinitions) {
  const slot = `${workout.levelNumber}:${workout.emphasisNumber}`
  if (slots.has(slot)) fail(`Duplicate workout slot ${slot}`)
  slots.add(slot)

  if (workout.durationMinutes < 50 || workout.durationMinutes > 60) {
    fail(`${workout.title} is outside the 50–60 minute duration target`)
  }

  const movementSections = workout.content.filter(
    (section) => "movements" in section,
  )
  for (const section of movementSections) {
    if (section.prescriptions && section.prescriptions.length !== 4) {
      fail(`${workout.title} / ${section.title} needs four prescriptions`)
    }
    for (const movement of section.movements) {
      if (movement.prescriptions.length !== 4) {
        fail(`${workout.title} / ${movement.name} needs four prescriptions`)
      }
    }
  }

  if (!workout.content.some((section) => section.kind === "decompression")) {
    fail(`${workout.title} is missing decompression`)
  }

  const recordSections = workout.content.filter(
    (section) => section.kind === "record",
  )
  if (recordSections.length !== 1) {
    fail(`${workout.title} needs one record section`)
  } else {
    const ids = recordSections[0].fields.map((field) => field.id)
    if (new Set(ids).size !== ids.length) {
      fail(`${workout.title} has duplicate record field IDs`)
    }
  }

  const text = JSON.stringify(workout)
  if (/barbell|chin-up|front[ -]lever/i.test(text)) {
    fail(`${workout.title} contains an excluded movement focus`)
  }
  if (/youtu\.be|youtube\.com\/(watch|embed)/i.test(text)) {
    fail(`${workout.title} contains a fixed or embedded YouTube video`)
  }
}

for (const level of builtToMoveProgram.levels) {
  const workouts = builtToMoveDefinitions.filter(
    (workout) => workout.levelNumber === level.number,
  )
  if (workouts.length !== 3) {
    fail(`Level ${level.number} does not contain three workouts`)
    continue
  }

  const patterns = new Set(
    workouts.flatMap((workout) => workout.movementPatterns),
  )
  for (const pattern of requiredPatterns) {
    if (!patterns.has(pattern)) {
      fail(`Level ${level.number} is missing ${pattern}`)
    }
  }

  const texts = workouts.map((workout) => JSON.stringify(workout))
  for (const focus of ["handstand", "pull-up", "pancake"]) {
    const exposures = texts.filter((text) =>
      new RegExp(focus, "i").test(text),
    ).length
    if (exposures !== 2) {
      fail(
        `Level ${level.number} needs two ${focus} exposures; found ${exposures}`,
      )
    }
  }

  if (!/handstand push-up/i.test(texts[1])) {
    fail(`Level ${level.number} Upper is missing handstand push-up work`)
  }
  if (!/bar muscle-up/i.test(texts[1])) {
    fail(`Level ${level.number} Upper is missing bar muscle-up work`)
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"))
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      valid: true,
      program: builtToMoveProgram.name,
      levels: builtToMoveProgram.levels.length,
      workoutDefinitions: builtToMoveDefinitions.length,
      recordableSessions: builtToMoveProgram.durationWeeks * 3,
      weeklyMovementExposures: {
        handstand: 2,
        pullUp: 2,
        pancake: 2,
      },
    },
    null,
    2,
  ),
)
