// Source: r/bodyweightfitness Recommended Routine and its progression pages
// https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/
// https://www.reddit.com/r/bodyweightfitness/wiki/exercises/

function movement(id, name, recordPrompt, options = {}) {
  return {
    id: `recommended-routine-${id}`,
    name,
    ...(recordPrompt ? { recordPrompt } : {}),
    ...(options.youtubeSearch === null ? { youtubeSearch: null } : {}),
    ...(typeof options.youtubeSearch === "string"
      ? { youtubeSearch: options.youtubeSearch }
      : {}),
  }
}

function progression(id, name, sets, placeholder, ladder) {
  return [
    movement(
      id,
      `${name} — ${sets}`,
      {
        label: `${name.replace(" progression", "")} step and reps`,
        placeholder,
      },
      { youtubeSearch: `bodyweightfitness ${name}` },
    ),
    `Ladder: ${ladder.join(" → ")}`,
  ]
}

export const recommendedRoutineProgram = {
  name: "Recommended Routine",
  slug: "recommended-routine",
  description:
    "The r/bodyweightfitness full-body strength routine: three exercise pairs and a core triplet, three times a week, with progression ladders instead of added load.",
  durationWeeks: null,
  isPublic: false,
  isShared: true,
  unrestrictedRecordsEnabled: true,
}

export const recommendedRoutineWorkouts = [
  {
    key: "full-body",
    position: 1,
    title: "Recommended Routine",
    summary:
      "Warm up, then train pull-up and squat, dip and hinge, row and push-up as pairs, and finish with a core triplet. Train three times a week with a rest day between sessions.",
    durationMinutes: 60,
    focus: ["Full body", "Strength", "Progression ladders"],
    equipment: [
      "Pull-up bar",
      "Parallel bars or dip station",
      "Low bar, rings, or sturdy table for rows",
      "Resistance band",
    ],
    content: [
      {
        title: "Warm-up — 5–10 minutes",
        exercises: [
          movement(
            "shoulder-band-warm-up",
            "Yuri's shoulder band warm-up — 5–10 reps",
          ),
          movement("squat-sky-reach", "Squat sky reach — 5–10 reps"),
          movement("wrist-prep", "GMB wrist prep — 10+ reps"),
          movement("deadbug", "Deadbug — 30 seconds"),
          movement("arch-hang", "Arch hang — 10 reps", undefined, {
            youtubeSearch: "bodyweightfitness arch hang",
          }),
          "Add arch hangs once you reach pull-up negatives.",
          movement("support-hold", "Support hold — 30 seconds"),
          "Add support holds once you reach negative dips.",
          movement(
            "easier-squat",
            "Easier squat progression — 10 reps",
            undefined,
            { youtubeSearch: null },
          ),
          "Add once you reach Bulgarian split squats.",
          movement(
            "easier-hinge",
            "Easier hinge progression — 10 reps",
            undefined,
            { youtubeSearch: null },
          ),
          "Add once you reach banded Nordic curls.",
        ],
      },
      {
        title: "First pair — 3 rounds",
        exercises: [
          ...progression(
            "pull-up",
            "Pull-up progression",
            "3 × 5–8",
            "Pull-up negatives, 6 / 6 / 5",
            [
              "Scapular pulls",
              "Arch hangs",
              "Pull-up negatives",
              "Pull-ups",
              "Weighted pull-ups",
            ],
          ),
          ...progression(
            "squat",
            "Squat progression",
            "3 × 5–8",
            "Bulgarian split squat, 8 / 7 / 7",
            [
              "Assisted squat",
              "Squat",
              "Split squat",
              "Bulgarian split squat",
              "Beginner shrimp squat",
              "Intermediate shrimp squat",
              "Advanced shrimp squat",
              "Weighted shrimp squat",
            ],
          ),
          "Rest 90 seconds after each exercise.",
        ],
      },
      {
        title: "Second pair — 3 rounds",
        exercises: [
          ...progression(
            "dip",
            "Dip progression",
            "3 × 5–8",
            "Parallel bar dips, 7 / 6 / 6",
            [
              "Parallel bar support hold",
              "Negative dips",
              "Parallel bar dips",
              "Weighted dips",
            ],
          ),
          ...progression(
            "hinge",
            "Hinge progression",
            "3 × 5–8",
            "Single-leg deadlift, 8 / 8 / 7",
            [
              "Romanian deadlift",
              "Single-leg deadlift",
              "Banded Nordic curl negatives",
              "Banded Nordic curls",
              "Nordic curls",
            ],
          ),
          "Rest 90 seconds after each exercise.",
        ],
      },
      {
        title: "Third pair — 3 rounds",
        exercises: [
          ...progression(
            "row",
            "Row progression",
            "3 × 5–8",
            "Horizontal rows, 8 / 7 / 6",
            [
              "Vertical rows",
              "Incline rows",
              "Horizontal rows",
              "Wide rows",
              "Weighted inverted rows",
            ],
          ),
          ...progression(
            "push-up",
            "Push-up progression",
            "3 × 5–8",
            "Diamond push-ups, 8 / 7 / 6",
            [
              "Vertical push-ups",
              "Incline push-ups",
              "Full push-ups",
              "Diamond push-ups",
              "Pseudo planche push-ups",
            ],
          ),
          "Rest 90 seconds after each exercise.",
        ],
      },
      {
        title: "Core triplet — 3 rounds",
        exercises: [
          ...progression(
            "anti-extension",
            "Anti-extension progression",
            "3 × 8–12",
            "Ring ab rollouts, 10 / 9 / 8",
            ["Plank", "Ring ab rollouts"],
          ),
          ...progression(
            "anti-rotation",
            "Anti-rotation progression",
            "3 × 8–12",
            "Banded Pallof press, 12 / 12 / 10",
            ["Banded Pallof press"],
          ),
          ...progression(
            "extension",
            "Extension progression",
            "3 × 8–12",
            "Reverse hyperextension, 12 / 10 / 10",
            ["Reverse hyperextension"],
          ),
          "Rest 60 seconds after each exercise.",
        ],
      },
      {
        title: "Session rules",
        exercises: [
          "Pick the step you can do for 3 × 5 with good form. Add a rep per set each session; at 3 × 8, move to the next step at 3 × 5.",
          "Holds count 10–30 seconds per set. Move to the next step once all three sets reach 30 seconds. Hold the plank to 30 seconds before ring ab rollouts.",
          "Stop one rep short of failure, e.g. 7 / 7 / 7 rather than 8 / 6 / 5. Rest up to 3 minutes when reps drop between sets.",
          "Tempo 10X0: one second down, no pause, drive up fast, no pause at the top.",
          "Train three times a week with at least one rest day between sessions.",
        ],
      },
    ],
  },
]
