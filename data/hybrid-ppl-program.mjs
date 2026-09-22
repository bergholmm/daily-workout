function movement(id, name, recordPrompt, options = {}) {
  return {
    id: `hybrid-ppl-${id}`,
    name,
    ...(recordPrompt ? { recordPrompt } : {}),
    ...(options.youtubeSearch === null ? { youtubeSearch: null } : {}),
    ...(typeof options.youtubeSearch === "string"
      ? { youtubeSearch: options.youtubeSearch }
      : {}),
  }
}

function prompt(label, placeholder) {
  return { label, ...(placeholder ? { placeholder } : {}) }
}

export const hybridPplProgram = {
  name: "Hybrid PPL",
  slug: "hybrid-ppl",
  description:
    "An ongoing Push, Run, Legs, Pull, Run sequence built around movement skill, weighted calisthenics, targeted pump work, flexibility, and sustainable easy running.",
  durationWeeks: null,
  isPublic: false,
  isShared: true,
  unrestrictedRecordsEnabled: true,
}

export const hybridPplWorkouts = [
  {
    key: "push",
    position: 1,
    title: "Push",
    summary:
      "Practice handstand balance and powerful pulling before building vertical and horizontal pressing strength, then finish with balanced upper-body pump work.",
    durationMinutes: 60,
    focus: ["Handstand", "HSPU", "Weighted dip", "Upper-body balance"],
    equipment: [
      "Wall",
      "Pull-up bar",
      "Dip bars or rings",
      "Chest-press machine",
      "Cable stack",
    ],
    content: [
      {
        title: "Preparation — 2 rounds",
        exercises: [
          movement("push-wrist-rock", "Wrist rock — 8 each direction"),
          movement("push-scapular-push-up", "Scapular push-up — 8 reps"),
          movement("push-wall-slide", "Wall slide — 8 reps"),
          movement(
            "push-ring-support-hold",
            "Ring support hold — 15–20 seconds",
          ),
        ],
      },
      {
        title: "Handstand — 8–10 minutes",
        exercises: [
          movement(
            "push-chest-to-wall-handstand",
            "Chest-to-wall handstand — 2 × 20–30 seconds",
          ),
          movement(
            "push-freestanding-kick-up",
            "Freestanding handstand kick-up — 6–10 measured attempts",
            prompt(
              "Best controlled handstand",
              "8 sec freestanding; balance improving",
            ),
          ),
          "Stop when line, balance, or entry quality begins to decline.",
        ],
      },
      {
        title: "Muscle-up contact",
        exercises: [
          movement(
            "push-explosive-high-pull",
            "Explosive high pull — 2 × 2 · Rest 60–90 seconds",
            prompt("High-pull result", "Lower chest with light band, 2 × 2"),
          ),
          "Use assistance when the bar does not reach the lower chest without losing shape.",
        ],
      },
      {
        title: "Primary strength",
        exercises: [
          movement(
            "push-wall-hspu",
            "Wall handstand push-up — 3 × 2–5 · 1–2 RIR · Rest 2 minutes",
            prompt("HSPU variation and reps", "Wall HSPU, 3 × 3"),
          ),
          "Use a pike push-up or reduce the range when the wall variation is not controlled.",
          movement(
            "push-weighted-dip",
            "Weighted dip — 3 × 5–8 · 2 RIR · Rest 2–3 minutes",
            prompt("Dip load and reps", "+10 kg, 8 / 7 / 6"),
          ),
        ],
      },
      {
        title: "Supporting pair — 2 rounds",
        exercises: [
          movement(
            "push-machine-chest-press",
            "Machine chest press — 8–12 reps",
            prompt("Chest-press load and reps", "45 kg, 12 / 10"),
          ),
          movement(
            "push-chest-supported-row",
            "Chest-supported row — 8–12 reps",
            prompt("Row load and reps", "40 kg, 12 / 11"),
          ),
          "Rest 75–90 seconds after the pair.",
        ],
      },
      {
        title: "Pump tri-set — 2–3 rounds",
        exercises: [
          movement(
            "push-lateral-raise",
            "Lateral raise — 12–20 reps",
            prompt("Lateral-raise load and reps", "7 kg, 18 / 16"),
          ),
          movement(
            "push-overhead-cable-triceps-extension",
            "Overhead cable triceps extension — 10–15 reps",
            prompt("Triceps-extension load and reps", "20 kg, 15 / 13"),
          ),
          movement(
            "push-face-pull",
            "Face pull — 15–20 reps",
            prompt("Face-pull load and reps", "18 kg, 20 / 18"),
          ),
          "Rest 60 seconds after the tri-set.",
        ],
      },
      {
        title: "Decompression",
        exercises: [
          movement(
            "push-bench-lat-stretch",
            "Bench lat stretch — 30 seconds per side",
          ),
          movement("push-wrist-release", "Wrist release — 30 seconds per side"),
          movement("push-optional-hang", "Optional relaxed hang — 30 seconds"),
        ],
      },
      {
        title: "Session rules",
        exercises: [
          "RIR means reps in reserve: finish main and pump sets with 1–2 clean repetitions left.",
          "When all sets reach the top of the rep range with the target RIR, add the smallest available load next time.",
          "When time is short, reduce the pump block by one round; keep preparation, skill, primary strength, and full rest periods.",
        ],
      },
    ],
  },
  {
    key: "easy-run",
    position: 2,
    title: "Easy Run",
    summary:
      "Build aerobic capacity and support recovery with relaxed, conversational running. Run-walk intervals are fully valid.",
    durationMinutes: 35,
    focus: ["Aerobic base", "Recovery", "Running tolerance"],
    equipment: ["Running shoes", "Flat route or treadmill"],
    content: [
      {
        title: "Warm-up — 5 minutes",
        exercises: [
          movement(
            "easy-run-warm-up",
            "Brisk walk into an easy jog — 5 minutes",
          ),
        ],
      },
      {
        title: "Easy run",
        exercises: [
          movement(
            "easy-run-result",
            "Run or run-walk — 25–40 minutes at conversational effort",
            prompt("Duration and distance", "32 min, 5.1 km"),
          ),
          movement(
            "easy-run-effort",
            "Keep the effort easy enough to speak in complete sentences; do not chase pace.",
            prompt("Effort and talk test", "Easy, full sentences, RPE 4"),
            { youtubeSearch: null },
          ),
          movement(
            "easy-run-knee-response",
            "The right knee should feel the same or better the next morning.",
            prompt("Knee response", "No pinch during or next morning"),
            { youtubeSearch: null },
          ),
          "Use run-walk intervals whenever they keep the effort and mechanics controlled.",
          "Stop or modify for sharp or pinching inner-knee pain.",
        ],
      },
      {
        title: "Cool-down — 3–5 minutes",
        exercises: [
          movement(
            "easy-run-cool-down",
            "Easy walk and relaxed breathing — 3–5 minutes",
          ),
        ],
      },
    ],
  },
  {
    key: "legs",
    position: 3,
    title: "Legs",
    summary:
      "Train compression, controlled single-leg strength, hamstrings, quads, lower legs, and careful hip and pancake range.",
    durationMinutes: 65,
    focus: ["Compression", "Single-leg strength", "Hip control", "Pancake"],
    equipment: [
      "Bench or box",
      "Dumbbells or kettlebells",
      "Leg-curl machine",
      "Leg-press or leg-extension machine",
    ],
    content: [
      {
        title: "Preparation — 2 rounds",
        exercises: [
          movement("legs-ankle-rock", "Ankle rock — 8 per side"),
          movement(
            "legs-supported-shinbox",
            "Supported shinbox transition — 5 per side",
          ),
          movement(
            "legs-supported-cossack",
            "Supported Cossack squat — 5 per side",
          ),
          movement(
            "legs-counterbalance-squat-pause",
            "Counterbalance squat pause — 5 reps",
          ),
          "Keep shinbox and Cossack range easy and controlled; never force the inner thigh or right knee.",
        ],
      },
      {
        title: "Compression skill — 6–8 minutes",
        exercises: [
          movement(
            "legs-l-sit-progression",
            "L-sit progression — 4 × 10–20 seconds",
            prompt("L-sit variation and best hold", "One-leg L-sit, 16 sec"),
          ),
          movement(
            "legs-straddle-compression",
            "Straddle compression lift — 2 × 5–8 reps",
            prompt("Compression setup and reps", "Elevated seat, 8 / 7"),
          ),
          "Raise the seat until the torso can stay upright and the legs lift without momentum.",
        ],
      },
      {
        title: "Single-leg strength",
        exercises: [
          movement(
            "legs-pistol",
            "Weighted or paused pistol squat — 3 × 4–6 per side · Rest 90–120 seconds",
            prompt(
              "Pistol variation, load, and reps",
              "Paused bodyweight, 3 × 5/side",
            ),
          ),
          "Use a target or counterweight to keep the full rep controlled and the knee comfortable.",
        ],
      },
      {
        title: "Main pair — 3 rounds",
        exercises: [
          movement(
            "legs-rfess",
            "Rear-foot-elevated split squat — 6–10 per side",
            prompt("RFESS load and reps", "2 × 20 kg, 10 / 9 / 8 per side"),
          ),
          movement(
            "legs-single-leg-rdl",
            "Single-leg Romanian deadlift — 6–10 per side",
            prompt("Single-leg RDL load and reps", "20 kg, 3 × 8/side"),
          ),
          "Rest 90–120 seconds after the pair.",
        ],
      },
      {
        title: "Pump pair — 2 rounds",
        exercises: [
          movement(
            "legs-leg-curl",
            "Seated or lying leg curl — 10–15 reps",
            prompt(
              "Leg-curl machine, load, and reps",
              "Seated, 35 kg, 15 / 13",
            ),
          ),
          movement(
            "legs-quad-machine",
            "Leg press or leg extension — 10–15 reps",
            prompt("Quad machine, load, and reps", "Leg press, 90 kg, 15 / 14"),
          ),
          "Keep the same quad machine for at least six sessions so progression is measurable. Rest 60–90 seconds.",
        ],
      },
      {
        title: "Lower leg",
        exercises: [
          movement(
            "legs-calf-raise",
            "Calf raise — 3 × 10–20 reps",
            prompt("Calf-raise load and reps", "60 kg, 20 / 18 / 16"),
          ),
          movement(
            "legs-tibialis-raise",
            "Tibialis raise — 2 × 12–20 reps",
            prompt("Tibialis variation and reps", "Wall, 20 / 18"),
          ),
        ],
      },
      {
        title: "Flexibility",
        exercises: [
          movement(
            "legs-elevated-straddle-good-morning",
            "Elevated straddle good morning — 2 × 6 slow reps",
          ),
          movement(
            "legs-supported-pancake",
            "Supported pancake — accumulate 60–90 seconds at RPE 5–6",
            prompt("Pancake setup and range", "40 cm seat, elbows to bench"),
          ),
          movement(
            "legs-hip-flexor-stretch",
            "Half-kneeling hip-flexor stretch — 30 seconds per side",
          ),
          movement(
            "legs-optional-cossack-hold",
            "Optional supported Cossack hold — 20–30 seconds per side",
          ),
          movement(
            "legs-knee-response",
            "Check that the right knee is the same or better the next morning.",
            prompt("Knee response", "No pinch during or next morning"),
            { youtubeSearch: null },
          ),
          "Progress only one flexibility variable at a time: range, support height, load, or total hold time.",
        ],
      },
      {
        title: "Session rules",
        exercises: [
          "Keep 1–2 RIR on strength and pump work. Add reps before adding the smallest available load.",
          "Stop or modify any movement that causes sharp or pinching inner-knee pain.",
          "When time is short, reduce the pump block by one round; keep preparation, skill, primary strength, and full rest periods.",
        ],
      },
    ],
  },
  {
    key: "pull",
    position: 4,
    title: "Pull",
    summary:
      "Practice the bar muscle-up, build weighted vertical and horizontal pulling strength, retain pushing balance, and finish with complete back and arm work.",
    durationMinutes: 60,
    focus: ["Bar muscle-up", "Weighted pull-up", "Back", "Arms"],
    equipment: [
      "Pull-up bar",
      "Bands",
      "Rings",
      "Row machine or bench",
      "Cable stack or machines",
    ],
    content: [
      {
        title: "Preparation — 2 rounds",
        exercises: [
          movement("pull-active-hang", "Active hang — 20 seconds"),
          movement("pull-scapular-pull-up", "Scapular pull-up — 6 reps"),
          movement("pull-hollow-to-arch", "Hollow-to-arch swing — 5 reps"),
          movement(
            "pull-external-rotation",
            "Light cable or band external rotation — 10 per side",
          ),
        ],
      },
      {
        title: "Bar muscle-up — 3 rounds",
        exercises: [
          movement(
            "pull-explosive-high-pull",
            "Explosive high pull — 2 reps",
            prompt(
              "High-pull height and assistance",
              "Lower chest, light band, 3 × 2",
            ),
          ),
          movement(
            "pull-assisted-muscle-up",
            "Band muscle-up or assisted transition — 1–2 reps",
            prompt("Muscle-up variation and reps", "Medium band, 2 / 2 / 1"),
          ),
          "Rest 90–120 seconds. Attempt an unassisted rep only after a lower-chest pull and smooth assisted turnover.",
          "Stop the skill block after two missed repetitions or any clear decline in quality.",
        ],
      },
      {
        title: "Primary strength",
        exercises: [
          movement(
            "pull-weighted-pull-up",
            "Weighted pull-up — 3 × 5–8 · 2 RIR · Rest 2–3 minutes",
            prompt("Pull-up load and reps", "+12.5 kg, 8 / 7 / 6"),
          ),
          movement(
            "pull-horizontal-row",
            "Stable horizontal row — 3 × 8–12 · Rest 90 seconds",
            prompt(
              "Row variation, load, and reps",
              "Cable row, 55 kg, 12 / 11 / 10",
            ),
          ),
        ],
      },
      {
        title: "Supporting pair — 2–3 rounds",
        exercises: [
          movement(
            "pull-weighted-ring-push-up",
            "Weighted ring push-up — 8–15 reps",
            prompt("Ring push-up load and reps", "+10 kg, 15 / 13 / 11"),
          ),
          movement(
            "pull-trunk-or-carry",
            "Hanging knee or leg raise, or suitcase carry — 8–15 reps or 20–30 m per side",
            prompt("Trunk or carry result", "Knee raise, 12 / 11 / 10"),
            { youtubeSearch: "hanging knee raise" },
          ),
          "Choose one trunk or carry option and keep it for at least four sessions. Rest 75–90 seconds.",
        ],
      },
      {
        title: "Pump tri-set — 2–3 rounds",
        exercises: [
          movement(
            "pull-straight-arm-pulldown",
            "Cable pullover or straight-arm pulldown — 10–15 reps",
            prompt("Pullover load and reps", "25 kg, 15 / 13 / 12"),
            { youtubeSearch: "cable straight arm pulldown" },
          ),
          movement(
            "pull-reverse-pec-deck",
            "Reverse pec deck — 12–20 reps",
            prompt("Reverse pec-deck load and reps", "30 kg, 20 / 18 / 16"),
          ),
          movement(
            "pull-curl",
            "Cable or machine curl — 10–15 reps",
            prompt(
              "Curl variation, load, and reps",
              "Cable curl, 20 kg, 15 / 13 / 12",
            ),
          ),
          "Rest 60 seconds after the tri-set.",
        ],
      },
      {
        title: "Decompression",
        exercises: [
          movement("pull-relaxed-hang", "Relaxed hang — 45–60 seconds"),
          movement(
            "pull-ring-shoulder-stretch",
            "Ring shoulder stretch — 30 seconds",
          ),
          movement(
            "pull-thread-the-needle",
            "Thread the needle — 5 slow reps per side",
          ),
        ],
      },
      {
        title: "Session rules",
        exercises: [
          "Keep 1–2 RIR on strength and pump work. Add reps before adding the smallest available load.",
          "Skill work ends when height, turnover, or body line declines; a harder variation is never owed on a given day.",
          "When time is short, reduce the pump block by one round; keep preparation, skill, primary strength, and full rest periods.",
        ],
      },
    ],
  },
  {
    key: "longer-easy-run",
    position: 5,
    title: "Longer Easy Run",
    summary:
      "Extend easy aerobic time without turning the session into a pace test. Running, run-walk intervals, and low-impact cycling all count.",
    durationMinutes: 55,
    focus: ["Aerobic endurance", "Impact tolerance", "Recovery"],
    equipment: ["Running shoes", "Flat route, treadmill, or bicycle"],
    content: [
      {
        title: "Warm-up — 5 minutes",
        exercises: [
          movement(
            "long-run-warm-up",
            "Brisk walk into an easy jog — 5 minutes",
          ),
        ],
      },
      {
        title: "Longer easy run",
        exercises: [
          movement(
            "long-run-result",
            "Run or run-walk — 40–60 minutes at conversational effort",
            prompt("Duration and distance", "52 min, 8.1 km"),
          ),
          movement(
            "long-run-effort",
            "Keep the effort easy enough to speak in complete sentences; do not chase pace.",
            prompt("Effort and talk test", "Easy, full sentences, RPE 4"),
            { youtubeSearch: null },
          ),
          movement(
            "long-run-knee-response",
            "The right knee should feel the same or better the next morning.",
            prompt("Knee response", "No pinch during or next morning"),
            { youtubeSearch: null },
          ),
          "Use run-walk intervals freely. Substitute easy cycling when impact is not appropriate that day.",
          "Stop or modify for sharp or pinching inner-knee pain.",
        ],
      },
      {
        title: "Cool-down — 3–5 minutes",
        exercises: [
          movement(
            "long-run-cool-down",
            "Easy walk and relaxed breathing — 3–5 minutes",
          ),
        ],
      },
    ],
  },
]

export function hybridPplPublicationKey(workout) {
  return `${hybridPplProgram.slug}:${workout.key}`
}

export function hybridPplReferenceDate(workout) {
  return `2000-01-${String(workout.position).padStart(2, "0")}`
}
