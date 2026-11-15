// Source: r/bodyweightfitness Recommended Routine and its progression pages
// https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/
// https://www.reddit.com/r/bodyweightfitness/wiki/exercises/

function warmUp(id, name, prescription, youtubeSearch = name) {
  return {
    id: `recommended-routine-${id}`,
    name: `${name} (${prescription})`,
    youtubeSearch,
  }
}

function progression(id, name, reps, placeholder) {
  return {
    id: `recommended-routine-${id}`,
    name: `${name} (${reps} Reps)`,
    youtubeSearch: `bodyweightfitness ${name}`,
    recordPrompt: { label: name, placeholder },
  }
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
    title: "Full Body",
    summary:
      "Three pairs and a core triplet. Alternate the exercises in each block, 3 times a week.",
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
        title: "Warm-up: [1 Set]",
        exercises: [
          warmUp(
            "shoulder-band-warm-up",
            "Shoulder Band Warm-up",
            "5-10 Reps",
            "Yuri's shoulder band warm-up",
          ),
          warmUp("squat-sky-reach", "Squat Sky Reach", "5-10 Reps"),
          warmUp("wrist-prep", "Wrist Prep", "10+ Reps", "GMB wrist prep"),
          warmUp("deadbug", "Deadbug", "30 Seconds"),
          warmUp("arch-hang", "Arch Hang", "10 Reps, from Negatives"),
          warmUp("support-hold", "Support Hold", "30 Seconds, from Dips"),
          warmUp(
            "easier-squat",
            "Easier Squat Step",
            "10 Reps, from Bulgarians",
            null,
          ),
          warmUp(
            "easier-hinge",
            "Easier Hinge Step",
            "10 Reps, from Nordics",
            null,
          ),
        ],
      },
      {
        title: "Pair 1: [3 Sets · Rest 90s]",
        exercises: [
          progression(
            "pull-up",
            "Pull-up Progression",
            "5-8",
            "Negatives, 6/6/5",
          ),
          progression(
            "squat",
            "Squat Progression",
            "5-8",
            "Bulgarian split squat, 8/7/7",
          ),
        ],
      },
      {
        title: "Pair 2: [3 Sets · Rest 90s]",
        exercises: [
          progression(
            "dip",
            "Dip Progression",
            "5-8",
            "Parallel bar dips, 7/6/6",
          ),
          progression(
            "hinge",
            "Hinge Progression",
            "5-8",
            "Single-leg deadlift, 8/8/7",
          ),
        ],
      },
      {
        title: "Pair 3: [3 Sets · Rest 90s]",
        exercises: [
          progression(
            "row",
            "Row Progression",
            "5-8",
            "Horizontal rows, 8/7/6",
          ),
          progression(
            "push-up",
            "Push-up Progression",
            "5-8",
            "Diamond push-ups, 8/7/6",
          ),
        ],
      },
      {
        title: "Core Triplet: [3 Sets · Rest 60s]",
        exercises: [
          progression(
            "anti-extension",
            "Anti-Extension Progression",
            "8-12",
            "Ring ab rollouts, 10/9/8",
          ),
          progression(
            "anti-rotation",
            "Anti-Rotation Progression",
            "8-12",
            "Banded Pallof press, 12/12/10",
          ),
          progression(
            "extension",
            "Extension Progression",
            "8-12",
            "Reverse hyperextension, 12/10/10",
          ),
        ],
      },
      {
        title: "Progressions",
        exercises: [
          "Start each step at 3 × 5 and add a rep per set each session. At 3 × 8, move to the next step. Holds: 10-30 seconds, move on at 3 × 30s.",
          "Pull-up: Scapular Pulls → Arch Hangs → Negatives → Pull-ups → Weighted",
          "Squat: Assisted → Squat → Split Squat → Bulgarian → Shrimp (Beginner → Intermediate → Advanced → Weighted)",
          "Dip: Support Hold → Negatives → Parallel Bar Dips → Weighted",
          "Hinge: Romanian Deadlift → Single-Leg Deadlift → Banded Nordic Negatives → Banded Nordics → Nordics",
          "Row: Vertical → Incline → Horizontal → Wide → Weighted",
          "Push-up: Vertical → Incline → Full → Diamond → Pseudo Planche",
          "Anti-Extension: Plank (to 30s) → Ring Ab Rollouts",
          "Anti-Rotation: Banded Pallof Press",
          "Extension: Reverse Hyperextension",
        ],
      },
    ],
  },
]
