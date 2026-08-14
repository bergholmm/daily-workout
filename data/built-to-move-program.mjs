const same = (value) => [value, value, value, value]

const movement = (id, name, prescriptions, options = {}) => ({
  id,
  name,
  prescriptions,
  ...options,
})

const section = (id, kind, title, movements, options = {}) => ({
  id,
  kind,
  title,
  movements,
  ...options,
})

const record = (fields) => ({
  id: "record",
  kind: "record",
  title: "Record",
  fields,
})

const field = (id, label, placeholder, options = {}) => ({
  id,
  label,
  placeholder,
  ...options,
})

const levels = [
  {
    number: 1,
    name: "Positions and Control",
    weeks: [1, 2, 3, 4],
    description:
      "Establish honest starting measures, controllable ranges, and repeatable skill positions.",
  },
  {
    number: 2,
    name: "Strength Through Range",
    weeks: [5, 6, 7, 8],
    description:
      "Add load, range, and connected skill work while keeping every earlier fallback.",
  },
  {
    number: 3,
    name: "Integration and Expression",
    weeks: [9, 10, 11, 12],
    description:
      "Use the strongest reliable movement levels and record meaningful benchmarks without forcing final skills.",
  },
]

export const builtToMoveProgram = {
  name: "Built to Move",
  slug: "built-to-move",
  description:
    "A self-paced 12-week movement program for bodyweight skill, useful strength, flexibility, and long-term physical capacity.",
  durationWeeks: 12,
  levels,
}

const levelOneLower = {
  levelNumber: 1,
  emphasisNumber: 1,
  emphasis: "Lower",
  title: "Lower Control and Elevated Pancake",
  summary:
    "Build controllable one-leg strength, kettlebell capacity, and an elevated pancake position.",
  durationMinutes: 58,
  focus: ["Pistol control", "Kettlebell strength", "Pancake"],
  movementPatterns: ["squat", "hinge", "one-leg work", "trunk control"],
  equipment: ["Kettlebells", "Bench or box", "Open floor"],
  content: [
    section(
      "lower-preparation",
      "preparation",
      "Preparation — 2 rounds · 7–8 minutes",
      [
        movement("spine-wave", "Spine wave", same("5 controlled reps")),
        movement(
          "supported-shinbox-switch",
          "Hand-supported shinbox switch",
          same("5/side"),
          {
            scaling: [
              "Use a smaller range or stop when the right knee produces a sharp pinch",
            ],
          },
        ),
        movement(
          "assisted-dragon-lunge",
          "Assisted alternating dragon lunge",
          same("4/side"),
          {
            scaling: [
              "Use hand support and a smaller range; this is preparation, not a flexibility test",
            ],
          },
        ),
        movement(
          "counterbalance-squat",
          "Counterbalance squat",
          same("5 reps with a 3-second bottom hold"),
        ),
      ],
    ),
    section("lower-control", "main", "Block A — 3 paired rounds", [
      movement(
        "pistol",
        "Pistol to target or counterweighted pistol",
        [
          "3/side with a 3-second lowering phase; establish target height",
          "4/side at the same setting",
          "3/side with a lower target or less assistance",
          "3/side at the Week 3 setting; record the cleanest result",
        ],
        {
          scaling: [
            "Raise the target or add a counterweight until the foot and knee stay controlled",
            "Sharp right-knee pinching means reduce range, add support, or stop",
          ],
        },
      ),
      movement(
        "single-leg-rdl",
        "Single-leg Romanian deadlift",
        [
          "6/side with 3 good reps available",
          "7/side at the same load",
          "6/side with the smallest useful load increase",
          "6/side at the Week 3 load",
        ],
        { scaling: ["Use light hand support when balance limits the hinge"] },
      ),
    ]),
    section("lower-strength", "main", "Block B — 3 paired rounds", [
      movement(
        "double-kettlebell-front-squat",
        "Double-kettlebell front squat",
        [
          "6 reps with 3 good reps available",
          "7 reps at the same load",
          "6 reps with a small load increase",
          "6 reps at the Week 3 load",
        ],
        {
          scaling: [
            "Use a heavy goblet squat when two kettlebells are not ready",
          ],
        },
      ),
      movement(
        "single-arm-swing",
        "Single-arm kettlebell swing",
        [
          "8/side",
          "10/side at the same load",
          "8/side with a small load increase",
          "8/side at the Week 3 load",
        ],
        {
          scaling: [
            "Use 12 two-hand swings when the single-arm version changes the hinge, grip, or trunk position",
          ],
        },
      ),
    ]),
    section("lower-range", "flexibility", "Block C — 2 paired rounds", [
      movement(
        "rear-foot-elevated-split-squat",
        "Rear-foot-elevated split squat",
        [
          "6/side with support available",
          "7/side at the same load and range",
          "6/side with more load or range, not both",
          "6/side at the Week 3 setting; use 1 round if fatigue is high",
        ],
        { scaling: ["Use a lower rear-foot support or hand support"] },
      ),
      movement(
        "elevated-straddle-work",
        "Elevated straddle good morning and leg lift",
        [
          "6 slow hinges plus 5 leg lifts/side",
          "7 hinges plus 6 leg lifts/side",
          "6 hinges plus 5 leg lifts/side from a slightly lower seat or with a very light load",
          "Repeat the Week 3 setting and record seat height",
        ],
        {
          scaling: [
            "Raise the seat until the torso is upright and the pelvis can tip forward",
            "Loaded work stays at effort 5–6 out of 10",
          ],
        },
      ),
    ]),
    section(
      "lower-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "supported-pancake-hold",
          "Supported pancake hold",
          same("Accumulate 60 seconds"),
        ),
        movement(
          "supported-90-90-switch",
          "Hand-supported 90/90 hip switch",
          same("4/side"),
          { scaling: ["Use the smallest range that does not pinch the knee"] },
        ),
        movement(
          "forward-fold-breathing",
          "Straight-leg forward-fold breathing",
          same("5 slow breaths"),
        ),
      ],
    ),
    record([
      field(
        "pistol-setting",
        "Pistol variation and target height",
        "Box height or counterweight",
      ),
      field(
        "front-squat",
        "Front-squat total load and final-set effort",
        "Load · effort",
      ),
      field("single-leg-rdl", "Single-leg RDL load", "Load per hand"),
      field(
        "split-squat",
        "Split-squat load and range",
        "Load · support · depth",
      ),
      field("swing", "Swing variation and load", "Variation · load"),
      field("pancake", "Pancake seat height and load", "Seat height · load"),
      field(
        "right-knee-response",
        "Right-knee response",
        "None · modified · sharp pinch and movement",
      ),
      field("notes", "Optional note", "Anything that should guide next week"),
    ]),
  ],
}

const levelOneUpper = {
  levelNumber: 1,
  emphasisNumber: 2,
  emphasis: "Upper",
  title: "Handstand Line and Muscle-Up Base",
  summary:
    "Establish handstand balance, bar turnover, weighted pull-up strength, and clean HSPU volume.",
  durationMinutes: 58,
  focus: ["Handstand", "Bar muscle-up", "Weighted pull-up", "HSPU"],
  movementPatterns: [
    "vertical push",
    "horizontal push",
    "vertical pull",
    "horizontal pull",
    "trunk control",
  ],
  equipment: ["Pull-up bar", "Low bar", "Wall", "Rings", "Kettlebell"],
  content: [
    section(
      "upper-preparation",
      "preparation",
      "Preparation — 2 rounds · 6–8 minutes",
      [
        movement("wrist-rock", "Wrist rock", same("8 each direction")),
        movement("scapular-push-up", "Scapular push-up", same("8 reps")),
        movement("scapular-pull-up", "Scapular pull-up", same("6 reps")),
        movement(
          "kettlebell-arm-bar",
          "Kettlebell arm bar",
          same("3 slow breaths/side with a light load"),
        ),
      ],
    ),
    section("handstand", "skill", "Handstand — 8–10 minutes", [
      movement(
        "handstand-practice",
        "Handstand practice",
        [
          "Chest-to-wall handstand 2 × 20 seconds; toe pull or wall weight shift 3 × 2; 5 measured freestanding kick-ups",
          "Chest-to-wall handstand 2 × 25 seconds; balance drill 3 × 3; 6 freestanding kick-ups",
          "One 30-second line hold; 6–8 freestanding attempts with the most useful wall balance drill between attempts",
          "One line hold; 5 measured kick-ups; record successful holds and best hold",
        ],
        {
          scaling: [
            "Use a box-pike hold when the overhead line or wrists are not ready for the wall",
          ],
        },
      ),
    ]),
    section("bar-muscle-up", "skill", "Bar muscle-up — 6–8 minutes", [
      movement(
        "bar-muscle-up-practice",
        "Bar muscle-up practice",
        [
          "3 rounds: 2 explosive high pulls plus 3 feet-assisted low-bar transitions",
          "3 rounds: 3 explosive high pulls plus 3 transitions at the same assistance",
          "3 rounds: 2 high pulls to a higher target plus 3 transitions with less foot assistance",
          "6 high pulls and 6 transitions at the best clean Week 3 settings",
        ],
        {
          scaling: [
            "Use more foot support and a lower bar until the turnover stays smooth",
            "Stop when pull height or turnover speed clearly falls",
          ],
        },
      ),
    ]),
    section(
      "upper-main-strength",
      "main",
      "Main strength pair",
      [
        movement(
          "weighted-pull-up",
          "Weighted pull-up",
          [
            "One clean bodyweight capacity set, stopping before the first poor rep; rest 3 minutes; 2 × 3 with bodyweight or a small added load",
            "3 × 5 with 3 good reps available",
            "3 × 4 with a small load increase and 2 good reps available",
            "One clean set of 4–6 at the strongest reliable load, then 2 × 4 with an easier load",
          ],
          {
            scaling: ["Use bodyweight pull-ups when added load is not ready"],
          },
        ),
        movement(
          "wall-handstand-push-up",
          "Wall handstand push-up",
          [
            "One clean set capped at 5, then 2 × 1–2",
            "4 × 2 at the established range",
            "4 × 2–3 at the same range; do not add a deficit yet",
            "One clean set capped at 6, then 2 × 2",
          ],
          {
            scaling: [
              "Use a pike HSPU or reduced wall range when head-to-floor reps are not clean",
            ],
          },
        ),
      ],
      {
        notes: ["Rest 90–150 seconds after each paired round"],
      },
    ),
    section("upper-support", "main", "Support pair", [
      movement("ring-row", "Ring row", [
        "2 × 10 with 3 good reps available",
        "3 × 10 at the same angle",
        "2 × 8 at a harder angle or with load",
        "2 × 8 at the Week 3 setting",
      ]),
      movement(
        "lean-forward-push-up",
        "Lean-forward push-up",
        [
          "2 × 6–8",
          "3 × 6–8",
          "2 × 6 at a greater lean",
          "2 × 6 at the Week 3 setting",
        ],
        {
          scaling: ["Reduce the lean or use a standard push-up"],
        },
      ),
    ]),
    section(
      "upper-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "relaxed-dead-hang",
          "Relaxed dead hang",
          same("Accumulate 30–45 seconds"),
        ),
        movement(
          "bench-lat-stretch",
          "Bench lat stretch",
          same("30 seconds/side"),
        ),
        movement("thread-the-needle", "Thread-the-needle", same("5/side")),
      ],
    ),
    record([
      field(
        "handstand",
        "Handstand best hold and successful attempts",
        "Best hold · successful attempts",
      ),
      field("hspu", "HSPU range and clean reps", "Variation · range · reps"),
      field(
        "high-pull",
        "Highest repeatable high-pull target",
        "Chest · lower chest · other",
      ),
      field(
        "transition",
        "Muscle-up transition support",
        "Bar height · foot or band assistance",
      ),
      field("pull-up", "Pull-up load and reps", "Load · sets × reps"),
      field("row-push", "Row and push variations", "Variation · load or angle"),
      field(
        "upper-joint-response",
        "Wrist, shoulder, or elbow response",
        "None or movement and response",
      ),
      field("notes", "Optional note", "Anything that should guide next week"),
    ]),
  ],
}

const levelOneConditioning = {
  levelNumber: 1,
  emphasisNumber: 3,
  emphasis: "Conditioning",
  title: "Repeatable Movement Base",
  summary:
    "Build controlled full-body capacity with a second handstand and pull-up exposure.",
  durationMinutes: 52,
  focus: ["Handstand balance", "Full-body capacity", "Carries", "Pancake"],
  movementPatterns: [
    "vertical pull",
    "horizontal push",
    "squat",
    "hinge",
    "one-leg work",
    "trunk control",
    "carry",
    "locomotion",
  ],
  equipment: ["Pull-up bar", "Kettlebell", "Box", "Open floor"],
  content: [
    section(
      "conditioning-preparation",
      "preparation",
      "Preparation — 2 rounds · about 6 minutes",
      [
        movement("march-calf-raise", "March to calf raise", same("8/side")),
        movement(
          "supported-hip-switch",
          "Hand-supported hip switch",
          same("5/side"),
          {
            scaling: [
              "Use a smaller range or stop when the right knee pinches",
            ],
          },
        ),
        movement("scapular-push-up", "Scapular push-up", same("8 reps")),
        movement("bear-crawl", "Bear crawl", same("10 metres")),
      ],
    ),
    section(
      "conditioning-handstand",
      "skill",
      "Handstand balance — 6–8 minutes",
      [
        movement(
          "handstand-balance",
          "Handstand balance practice",
          [
            "One wall line hold and 5 fresh kick-ups",
            "One wall balance drill and 6 fresh kick-ups",
            "8 attempts at the best current balance drill",
            "5 measured attempts; record the best hold",
          ],
          {
            notes: ["No HSPU work in Conditioning"],
            scaling: [
              "Use wall balance drills instead of freestanding attempts",
            ],
          },
        ),
      ],
    ),
    section(
      "conditioning-circuit-a",
      "conditioning",
      "Circuit A — ground movement and vertical pull",
      [
        movement(
          "hip-switch-kick-through",
          "Hip switch to kick-through",
          same("4/side"),
          {
            scaling: ["Keep one hand down and reduce hip-rotation range"],
          },
        ),
        movement(
          "strict-pull-up",
          "Strict pull-up",
          same("3–5 with at least 3 good reps available"),
        ),
      ],
      {
        prescriptions: [
          "2 rounds; establish loads and keep effort at 6 out of 10",
          "3 rounds",
          "3 rounds; add load to the swing or carry, not both",
          "Repeat the Week 3 setup at the same or lower effort",
        ],
      },
    ),
    section(
      "conditioning-circuit-b",
      "conditioning",
      "Circuit B — hinge and horizontal push",
      [
        movement(
          "two-hand-swing",
          "Two-hand kettlebell swing",
          same("10 reps"),
          {
            scaling: [
              "Use a kettlebell dead-stop hinge when swing timing is not reliable",
            ],
          },
        ),
        movement("push-up", "Floor or incline push-up", same("8 reps"), {
          scaling: ["Raise the hands until every rep remains controlled"],
        }),
      ],
      {
        prescriptions: ["2 rounds", "3 rounds", "3 rounds", "Repeat Week 3"],
      },
    ),
    section(
      "conditioning-circuit-c",
      "conditioning",
      "Circuit C — carry, step, and light pancake",
      [
        movement("farmer-carry", "Farmer carry", same("30 metres")),
        movement("step-up", "Step-up", same("6/side"), {
          scaling: [
            "Lower the box or use hand support when the knee response changes",
          ],
        }),
        movement(
          "supported-pancake-hold",
          "Supported pancake hold",
          same("30 seconds"),
          {
            scaling: ["Raise the seat until the torso is upright"],
          },
        ),
      ],
      {
        prescriptions: ["2 rounds", "2 rounds", "2 rounds", "Repeat Week 3"],
        notes: [
          "Rest 45–75 seconds after each round or longer when pull-up quality requires it",
        ],
      },
    ),
    section(
      "conditioning-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "supported-cossack-shift",
          "Supported Cossack shift",
          same("5/side"),
        ),
        movement(
          "pancake-breathing",
          "Supported pancake breathing",
          same("30 seconds"),
        ),
        movement(
          "half-kneeling-overhead-reach",
          "Half-kneeling overhead reach",
          same("30 seconds/side"),
        ),
        movement("easy-walk", "Easy walk with long exhales", same("2 minutes")),
      ],
    ),
    record([
      field("handstand", "Handstand result", "Best hold · successful attempts"),
      field("circuit-rounds", "Circuit rounds", "A · B · C"),
      field("swing-carry-loads", "Swing and carry loads", "Swing · carry"),
      field("pull-push", "Pull-up and push-up variations", "Variations · reps"),
      field(
        "right-knee-response",
        "Right-knee response",
        "None · modified · sharp pinch and movement",
      ),
      field("session-effort", "Session effort", "1–10"),
      field("notes", "Optional note", "Anything that should guide next week"),
    ]),
  ],
}

const levelTwoLower = {
  levelNumber: 2,
  emphasisNumber: 1,
  emphasis: "Lower",
  title: "Strength Through Range",
  summary:
    "Add load and active range while retaining every controllable Level 1 fallback.",
  durationMinutes: 58,
  focus: ["Pistol range", "Kettlebell strength", "Active pancake"],
  movementPatterns: ["squat", "hinge", "one-leg work", "trunk control"],
  equipment: ["Kettlebells", "Bench or box", "Open floor"],
  content: [
    section(
      "lower-preparation",
      "preparation",
      "Preparation — 2 rounds · 7–8 minutes",
      [
        movement("spine-wave", "Spine wave", same("5 controlled reps")),
        movement(
          "supported-shinbox-extension",
          "Supported shinbox extension",
          same("4/side"),
          {
            scaling: [
              "Use the hand-supported shinbox switch whenever extension pinches the right knee",
            ],
          },
        ),
        movement(
          "assisted-dragon-sit",
          "Assisted dragon sit transition",
          same("4/side"),
          { scaling: ["Use both hands and reduce the transition range"] },
        ),
        movement(
          "supported-cossack-shift",
          "Supported Cossack shift",
          same("5/side"),
          { scaling: ["Keep the range above any sharp inner-knee response"] },
        ),
      ],
    ),
    section("lower-control", "main", "Block A — 3 paired rounds", [
      movement(
        "pistol",
        "Tempo pistol",
        [
          "3/side with a 3-second lowering phase; use the Level 1 target if needed",
          "4/side at the same range",
          "3/side with a pause, lower target, or full range",
          "3/side at the best Week 7 setting",
        ],
        {
          scaling: [
            "Keep the Level 1 target when full range is not controlled or the knee pinches",
            "Use a full pistol only after 3 clean sets/side with a stable foot and no sharp knee pinch",
          ],
        },
      ),
      movement(
        "single-leg-rdl",
        "Single-leg Romanian deadlift",
        [
          "6/side with a modest load increase from Level 1",
          "7/side at the same load",
          "6/side with a small load increase",
          "6/side at the Week 7 load",
        ],
        {
          scaling: ["Use light hand support when balance limits the hinge"],
        },
      ),
    ]),
    section("lower-strength", "main", "Block B — 3 paired rounds", [
      movement(
        "double-kettlebell-front-squat",
        "Double-kettlebell front squat",
        [
          "6 reps with a modest load increase from Level 1",
          "7 reps at the same load",
          "6 reps with the smallest useful load increase",
          "6 reps at the Week 7 load",
        ],
        {
          scaling: [
            "Use a heavy goblet squat when two kettlebells are not ready",
          ],
        },
      ),
      movement(
        "single-arm-swing",
        "Single-arm kettlebell swing",
        [
          "8/side",
          "10/side at the same load",
          "8/side with a small load increase",
          "8/side at the Week 7 load",
        ],
        {
          scaling: [
            "Use 12 two-hand swings when timing or trunk control changes",
          ],
        },
      ),
    ]),
    section("lower-range", "flexibility", "Block C — 2 paired rounds", [
      movement(
        "rear-foot-elevated-split-squat",
        "Rear-foot-elevated split squat",
        [
          "6/side",
          "7/side at the same load",
          "6/side with more load or depth, not both",
          "6/side at the Week 7 setting; use 1 round if fatigue is high",
        ],
        {
          scaling: ["Use a lower rear-foot support or hand support"],
        },
      ),
      movement(
        "lower-support-straddle-work",
        "Lower-support straddle good morning and compression lift",
        [
          "6 hinges plus 5 lifts/side",
          "7 hinges plus 6 lifts/side",
          "6 hinges plus 5 lifts/side with lower support or light load",
          "Repeat Week 7 and record the support height",
        ],
        {
          scaling: [
            "Return to the Level 1 seat height whenever the pelvis cannot tip forward",
            "Loaded work stays at effort 5–6 out of 10",
          ],
        },
      ),
    ]),
    section(
      "lower-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "supported-half-frog",
          "Supported half-frog breathing",
          same("30 seconds/side"),
          { scaling: ["Skip or reduce range when the right knee pinches"] },
        ),
        movement(
          "supported-90-90-forward-fold",
          "Hand-supported 90/90 forward fold",
          same("30 seconds/side"),
        ),
        movement(
          "forward-fold-breathing",
          "Straight-leg forward-fold breathing",
          same("5 slow breaths"),
        ),
      ],
    ),
    record([
      field(
        "pistol-setting",
        "Pistol variation and target height",
        "Range · pause · load",
      ),
      field(
        "front-squat",
        "Front-squat total load and final-set effort",
        "Load · effort",
      ),
      field("single-leg-rdl", "Single-leg RDL load", "Load per hand"),
      field(
        "split-squat",
        "Split-squat load and range",
        "Load · support · depth",
      ),
      field("swing", "Swing variation and load", "Variation · load"),
      field("pancake", "Pancake support height and load", "Support · load"),
      field(
        "shinbox",
        "Shinbox variation",
        "Switch · supported extension · extension",
      ),
      field(
        "right-knee-response",
        "Right-knee response",
        "None · modified · sharp pinch and movement",
      ),
      field("notes", "Optional note", "Anything that should guide next week"),
    ]),
  ],
}

const levelTwoUpper = {
  levelNumber: 2,
  emphasisNumber: 2,
  emphasis: "Upper",
  title: "Handstand Balance and Muscle-Up Integration",
  summary:
    "Build repeatable freestanding balance and connect high pulling to a complete assisted turnover.",
  durationMinutes: 58,
  focus: [
    "Handstand balance",
    "Bar muscle-up",
    "Weighted pull-up",
    "HSPU range",
  ],
  movementPatterns: [
    "vertical push",
    "horizontal push",
    "vertical pull",
    "horizontal pull",
    "trunk control",
  ],
  equipment: ["Pull-up bar", "Wall", "Rings", "Kettlebell", "Bands"],
  content: [
    section(
      "upper-preparation",
      "preparation",
      "Preparation — 2 rounds · 6–8 minutes",
      [
        movement("wrist-rock", "Wrist rock", same("8 each direction")),
        movement("scapular-push-up", "Scapular push-up", same("10 reps")),
        movement("scapular-pull-up", "Scapular pull-up", same("8 reps")),
        movement(
          "kettlebell-arm-bar",
          "Kettlebell arm bar",
          same("3 slow breaths/side"),
        ),
      ],
    ),
    section("handstand", "skill", "Handstand — 8–10 minutes", [
      movement(
        "handstand-practice",
        "Handstand practice",
        [
          "One 20-second line hold; balance drill 3 × 3; 6 freestanding attempts",
          "Balance drill 3 × 3; 8 freestanding attempts",
          "8–10 attempts with the same kick-up setup; use the wall after 2 poor attempts",
          "One line check; 5 measured attempts; record best hold and successful attempts",
        ],
        {
          scaling: [
            "Keep the Level 1 line and wall-balance drills as fallbacks",
          ],
        },
      ),
    ]),
    section("bar-muscle-up", "skill", "Bar muscle-up — 8–10 minutes", [
      movement(
        "bar-muscle-up-practice",
        "Bar muscle-up practice",
        [
          "3 rounds: 2 high pulls plus 1–2 band-assisted full muscle-ups",
          "Use the same assistance and add 1 clean assisted rep across the complete block",
          "Return to the Week 5 rep count and use a lighter band or higher pull target",
          "4–6 measured assisted singles at the best reliable setting",
        ],
        {
          scaling: [
            "Use the Level 1 feet-assisted transition whenever the band-assisted full rep is not smooth",
          ],
        },
      ),
    ]),
    section(
      "upper-main-strength",
      "main",
      "Main strength pair",
      [
        movement(
          "weighted-pull-up",
          "Weighted pull-up",
          [
            "3 × 5 with 3 good reps available",
            "3 × 6 at the same load",
            "3 × 4 with a small load increase",
            "One clean set of 4–6, then 2 × 4 with an easier load",
          ],
          {
            scaling: ["Use bodyweight pull-ups when added load is not ready"],
          },
        ),
        movement(
          "wall-handstand-push-up",
          "Wall handstand push-up",
          [
            "4 × 2 at the established range",
            "5 × 2 at the same range",
            "4 × 2 with a small deficit after the 5-rep quality check; otherwise 4 × 3 head-to-floor",
            "One clean set capped at 6, then 2 × 2 at the strongest reliable range",
          ],
          {
            scaling: [
              "Use the Level 1 HSPU range or pike HSPU without penalty",
              "Add a deficit only after 5 clean head-to-floor wall HSPUs",
            ],
          },
        ),
      ],
      {
        notes: ["Rest 90–150 seconds after each paired round"],
      },
    ),
    section("upper-support", "main", "Support pair — 2 rounds", [
      movement("feet-elevated-ring-row", "Feet-elevated ring row", [
        "8 reps with 2–3 good reps available",
        "9 reps at the same angle",
        "8 reps at a harder angle or with load",
        "8 reps at the Week 7 setting",
      ]),
      movement(
        "straight-bar-dip",
        "Straight-bar dip",
        [
          "4–6 reps",
          "5–7 reps",
          "4–6 reps with the strongest clean setting",
          "Repeat Week 7",
        ],
        {
          scaling: [
            "Use a ring push-up when the dip changes turnover quality or joint response",
          ],
        },
      ),
    ]),
    section(
      "upper-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "relaxed-dead-hang",
          "Relaxed dead hang",
          same("Accumulate 45 seconds"),
        ),
        movement(
          "ring-shoulder-extension",
          "Ring-supported shoulder extension",
          same("30 seconds"),
        ),
        movement("thread-the-needle", "Thread-the-needle", same("5/side")),
      ],
    ),
    record([
      field(
        "handstand",
        "Handstand best hold and successful attempts",
        "Best hold · successful attempts",
      ),
      field("hspu", "HSPU range and clean reps", "Variation · range · reps"),
      field(
        "muscle-up",
        "Band and successful muscle-ups",
        "Band · clean reps",
        { previousFieldIds: ["transition"] },
      ),
      field("high-pull", "Highest repeatable high-pull target", "Target"),
      field("pull-up", "Pull-up load and reps", "Load · sets × reps"),
      field("row-dip", "Row and dip results", "Variation · load · reps", {
        previousFieldIds: ["row-push"],
      }),
      field(
        "upper-joint-response",
        "Wrist, shoulder, or elbow response",
        "None or movement and response",
      ),
      field("notes", "Optional note", "Anything that should guide next week"),
    ]),
  ],
}

const levelTwoConditioning = {
  levelNumber: 2,
  emphasisNumber: 3,
  emphasis: "Conditioning",
  title: "Unilateral Movement Capacity",
  summary:
    "Build controlled capacity through one-side kettlebell work, ground strength, carries, and range.",
  durationMinutes: 52,
  focus: ["Handstand balance", "Unilateral capacity", "Carries", "Pancake"],
  movementPatterns: [
    "vertical pull",
    "horizontal push",
    "squat",
    "hinge",
    "one-leg work",
    "trunk control",
    "carry",
    "locomotion",
  ],
  equipment: ["Pull-up bar", "Kettlebell", "Rings", "Open floor"],
  content: [
    section(
      "conditioning-preparation",
      "preparation",
      "Preparation — 2 rounds · about 6 minutes",
      [
        movement(
          "marching-switch",
          "Marching switch or low skip",
          same("20 seconds"),
        ),
        movement(
          "supported-shinbox-extension",
          "Supported shinbox extension",
          same("4/side"),
          {
            scaling: [
              "Use the supported switch whenever the right knee pinches",
            ],
          },
        ),
        movement("scapular-push-up", "Scapular push-up", same("8 reps")),
        movement("gator-crawl", "Gator crawl", same("8 metres"), {
          scaling: ["Use a bear crawl when the step-through is not controlled"],
        }),
      ],
    ),
    section(
      "conditioning-handstand",
      "skill",
      "Handstand balance — 6–8 minutes",
      [
        movement(
          "handstand-balance",
          "Handstand balance practice",
          [
            "One line check, current wall balance drill, and 6 freestanding attempts",
            "Current wall balance drill and 8 freestanding attempts",
            "8 attempts at the strongest repeatable setup",
            "5 measured attempts; record the best hold",
          ],
          {
            scaling: ["Keep all Level 1 wall-balance fallbacks available"],
          },
        ),
      ],
    ),
    section(
      "conditioning-circuit-a",
      "conditioning",
      "Circuit A — ground strength and vertical pull",
      [
        movement("half-turkish-get-up", "Half Turkish get-up", same("2/side")),
        movement(
          "strict-pull-up",
          "Strict pull-up",
          same("4 reps with at least 3 good reps available"),
        ),
      ],
      {
        prescriptions: [
          "2 rounds; establish loads at effort 6–7 out of 10",
          "3 rounds",
          "3 rounds; add load to the swing or carry, not both",
          "Repeat the Week 7 setup and compare quality and effort",
        ],
      },
    ),
    section(
      "conditioning-circuit-b",
      "conditioning",
      "Circuit B — unilateral hinge and horizontal push",
      [
        movement(
          "single-arm-swing",
          "Single-arm kettlebell swing",
          same("8/side"),
          {
            scaling: [
              "Use a two-hand swing when timing or trunk control changes",
            ],
          },
        ),
        movement("push-up", "Ring or floor push-up", same("8 reps"), {
          scaling: ["Raise the hands or reduce ring instability"],
        }),
      ],
      {
        prescriptions: ["2 rounds", "3 rounds", "3 rounds", "Repeat Week 7"],
      },
    ),
    section(
      "conditioning-circuit-c",
      "conditioning",
      "Circuit C — carry, transition, and light pancake",
      [
        movement("suitcase-carry", "Suitcase carry", same("20 metres/side")),
        movement(
          "controlled-step-through",
          "Controlled step-through",
          same("4/side"),
          {
            scaling: [
              "Use hand support and reduce hip rotation when the knee pinches",
            ],
          },
        ),
        movement(
          "lower-pancake-hold",
          "Lower-support pancake hold",
          same("30 seconds"),
          {
            scaling: [
              "Return to the Level 1 seat height whenever the torso cannot stay upright",
            ],
          },
        ),
      ],
      {
        prescriptions: ["2 rounds", "2 rounds", "2 rounds", "Repeat Week 7"],
      },
    ),
    section(
      "conditioning-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "supported-cossack-shift",
          "Supported Cossack shift",
          same("5/side"),
        ),
        movement(
          "pancake-breathing",
          "Lower-support pancake breathing",
          same("30 seconds"),
        ),
        movement(
          "bench-lat-stretch",
          "Bench lat stretch",
          same("30 seconds/side"),
        ),
        movement("easy-walk", "Easy walk with long exhales", same("2 minutes")),
      ],
    ),
    record([
      field("handstand", "Handstand result", "Best hold · successful attempts"),
      field("circuit-rounds", "Circuit rounds", "A · B · C"),
      field("circuit-loads", "Circuit loads", "Get-up · swing · carry", {
        previousFieldIds: ["swing-carry-loads"],
      }),
      field("pull-push", "Pull-up and push-up variations", "Variations · reps"),
      field("transition", "Shinbox or transition variation", "Variation used"),
      field(
        "right-knee-response",
        "Right-knee response",
        "None · modified · sharp pinch and movement",
      ),
      field("session-effort", "Session effort", "1–10"),
      field("notes", "Optional note", "Anything that should guide next week"),
    ]),
  ],
}

const levelThreeLower = {
  levelNumber: 3,
  emphasisNumber: 1,
  emphasis: "Lower",
  title: "Lower Integration and Pancake Expression",
  summary:
    "Use the strongest qualified one-leg, kettlebell, and pancake settings without forcing the floor.",
  durationMinutes: 58,
  focus: ["Pistol expression", "Kettlebell strength", "Pancake expression"],
  movementPatterns: ["squat", "hinge", "one-leg work", "trunk control"],
  equipment: ["Kettlebells", "Bench or box", "Open floor"],
  content: [
    section(
      "lower-preparation",
      "preparation",
      "Preparation — 2 rounds · 7–8 minutes",
      [
        movement("spine-wave", "Spine wave", same("5 controlled reps")),
        movement(
          "shinbox-extension",
          "Supported or full shinbox extension",
          same("5/side"),
          {
            scaling: [
              "Keep the supported switch or extension whenever the right knee pinches",
            ],
          },
        ),
        movement(
          "assisted-dragon-lunge",
          "Assisted dragon lunge",
          same("5/side"),
          {
            scaling: ["Use hand support and the smallest controlled range"],
          },
        ),
        movement(
          "supported-cossack-squat",
          "Supported Cossack squat",
          same("5/side"),
          {
            scaling: ["Keep the range above any sharp inner-knee response"],
          },
        ),
      ],
    ),
    section("lower-control", "main", "Block A — 3 paired rounds", [
      movement(
        "pistol",
        "Paused or lightly loaded pistol",
        [
          "3/side at the strongest qualified variation",
          "4/side at the same setting",
          "3/side with a longer pause or light load",
          "3/side at the best Week 11 setting; record both sides",
        ],
        {
          scaling: [
            "Keep any earlier target or counterweight when full range is not controlled or the knee pinches",
            "Add a pause or light load only after 3 clean full-range sets/side with a stable foot and no sharp knee pinch",
          ],
        },
      ),
      movement(
        "single-leg-rdl",
        "Single-leg Romanian deadlift",
        [
          "6/side",
          "7/side at the same load",
          "6/side with a small load increase",
          "6/side at the Week 11 load",
        ],
        {
          scaling: ["Use light hand support when balance limits the hinge"],
        },
      ),
    ]),
    section("lower-strength", "main", "Block B — 3 paired rounds", [
      movement(
        "double-kettlebell-front-squat",
        "Double-kettlebell front squat",
        [
          "6 reps with 3 good reps available",
          "7 reps at the same load",
          "6 reps with a small load increase",
          "6 reps at the Week 11 load",
        ],
        {
          scaling: [
            "Use a heavy goblet squat when two kettlebells are not ready",
          ],
        },
      ),
      movement(
        "single-arm-swing",
        "Single-arm kettlebell swing",
        [
          "8/side",
          "10/side at the same load",
          "8/side with a small load increase",
          "8/side at the Week 11 load",
        ],
        {
          scaling: [
            "Use 12 two-hand swings when timing or trunk control changes",
          ],
        },
      ),
    ]),
    section("lower-range", "flexibility", "Block C — 2 paired rounds", [
      movement(
        "rear-foot-elevated-split-squat",
        "Rear-foot-elevated split squat",
        [
          "6/side",
          "7/side at the same load",
          "6/side with more load or controlled depth, not both",
          "6/side at the Week 11 setting; use 1 round if fatigue is high",
        ],
        {
          scaling: ["Use a lower rear-foot support or hand support"],
        },
      ),
      movement(
        "minimum-support-straddle-work",
        "Minimum-support straddle good morning and leg lift",
        [
          "6 hinges plus 5 lifts/side",
          "7 hinges plus 6 lifts/side",
          "6 hinges plus 5 lifts/side with lower support or very light load",
          "Repeat Week 11; the floor is not required",
        ],
        {
          scaling: [
            "Use any earlier seat height when the torso cannot stay upright and the pelvis cannot tip forward",
            "Loaded work stays at effort 5–6 out of 10",
          ],
        },
      ),
    ]),
    section(
      "lower-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "best-pancake-hold",
          "Best supported pancake hold",
          same("Accumulate 60 seconds"),
        ),
        movement(
          "supported-90-90-forward-fold",
          "Hand-supported 90/90 forward fold",
          same("30 seconds/side"),
          {
            scaling: ["Use the smallest range that does not pinch the knee"],
          },
        ),
        movement(
          "legs-up-breathing",
          "Legs-up breathing",
          same("5 slow breaths"),
        ),
      ],
    ),
    record([
      field(
        "pistol-setting",
        "Pistol variation, load, and left/right result",
        "Variation · load · left/right",
      ),
      field(
        "front-squat",
        "Front-squat total load and final-set effort",
        "Load · effort",
      ),
      field("single-leg-rdl", "Single-leg RDL load", "Load per hand"),
      field(
        "split-squat",
        "Split-squat load and range",
        "Load · support · depth",
      ),
      field("swing", "Swing variation and load", "Variation · load"),
      field("pancake", "Pancake support height and load", "Support · load"),
      field(
        "shinbox",
        "Shinbox variation",
        "Switch · supported extension · extension",
      ),
      field(
        "right-knee-response",
        "Right-knee response",
        "None · modified · sharp pinch and movement",
      ),
      field(
        "notes",
        "Optional note",
        "Anything that should guide the next cycle",
      ),
    ]),
  ],
}

const levelThreeUpper = {
  levelNumber: 3,
  emphasisNumber: 2,
  emphasis: "Upper",
  title: "Handstand and Bar Muscle-Up Expression",
  summary:
    "Express the strongest repeatable handstand, HSPU, pull-up, and muscle-up settings with earlier fallbacks intact.",
  durationMinutes: 58,
  focus: [
    "Handstand expression",
    "Bar muscle-up",
    "Weighted pull-up",
    "HSPU expression",
  ],
  movementPatterns: [
    "vertical push",
    "horizontal push",
    "vertical pull",
    "horizontal pull",
    "trunk control",
  ],
  equipment: ["Pull-up bar", "Wall", "Rings", "Bands"],
  content: [
    section(
      "upper-preparation",
      "preparation",
      "Preparation — 2 rounds · 6–8 minutes",
      [
        movement("wrist-rock", "Wrist rock", same("8 each direction")),
        movement("scapular-push-up", "Scapular push-up", same("10 reps")),
        movement("scapular-pull-up", "Scapular pull-up", same("8 reps")),
        movement(
          "hollow-arch-swing",
          "Hollow-to-arch swing",
          same("5 controlled cycles"),
        ),
      ],
    ),
    section("handstand", "skill", "Handstand — 8–10 minutes", [
      movement(
        "handstand-practice",
        "Handstand practice",
        [
          "One line check; 8 freestanding attempts; use the most useful wall balance drill after a miss",
          "10 attempts with the same kick-up setup and full rest",
          "8 attempts at the strongest repeatable setup; optional freestanding HSPU preparation can replace 2 attempts when qualified",
          "5 measured attempts; record the best hold and number of successful holds",
        ],
        {
          scaling: ["Keep every earlier wall line and balance drill available"],
        },
      ),
    ]),
    section("bar-muscle-up", "skill", "Bar muscle-up — 8–10 minutes", [
      movement(
        "bar-muscle-up-practice",
        "Bar muscle-up practice",
        [
          "4 clean assisted or unassisted singles at the best qualified setting",
          "5 clean singles at the same setting",
          "4–6 singles with less assistance or an unassisted small kip when qualified",
          "4–6 measured singles at the strongest reliable setting; stop after 2 misses",
        ],
        {
          scaling: [
            "Use 3 rounds of 2 high pulls and 2 assisted transitions when a full rep is not qualified",
            "Use an unassisted rep only after a repeatable lower-chest high pull, a smooth assisted turnover, 5 controlled straight-bar dips, and no painful elbow or shoulder response",
            "Stop after 2 misses or any painful elbow or shoulder response",
          ],
        },
      ),
    ]),
    section(
      "upper-main-strength",
      "main",
      "Main strength pair",
      [
        movement(
          "weighted-pull-up",
          "Weighted pull-up",
          [
            "3 × 5 with 3 good reps available",
            "3 × 6 at the same load",
            "3 × 4 with a small load increase",
            "One clean set of 4–6, then 2 × 4 with an easier load",
          ],
          {
            scaling: ["Use bodyweight pull-ups when added load is not ready"],
          },
        ),
        movement(
          "wall-handstand-push-up",
          "Wall handstand push-up",
          [
            "3 × 3 at the strongest qualified range",
            "4 × 3 at the same range",
            "3 × 2 with a small additional deficit when qualified; otherwise 4 × 3",
            "One clean set capped at 6, then 2 × 2 at the strongest reliable range",
          ],
          {
            scaling: [
              "Use any earlier wall or pike HSPU range without penalty",
              "Add a deficit only after 5 clean head-to-floor wall HSPUs",
              "At most 2 qualified freestanding negatives can replace 1 wall set",
              "Freestanding work requires repeatable balance, a safe exit, and 5 clean wall HSPUs",
            ],
          },
        ),
      ],
      {
        notes: ["Rest 90–150 seconds after each paired round"],
      },
    ),
    section("upper-support", "main", "Support pair — 2 rounds", [
      movement(
        "weighted-ring-row",
        "Weighted or feet-elevated ring row",
        same("6–8 reps"),
      ),
      movement("ring-push-up", "Ring push-up", same("6–10 reps"), {
        scaling: [
          "Straight-bar dips can replace the push-up only when they do not reduce turnover quality or change joint response",
        ],
      }),
    ]),
    section(
      "upper-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "relaxed-dead-hang",
          "Relaxed dead hang",
          same("Accumulate 60 seconds"),
        ),
        movement(
          "ring-shoulder-extension",
          "Ring-supported shoulder extension",
          same("30 seconds"),
        ),
        movement(
          "wrist-extension-release",
          "Wrist extension release",
          same("30 seconds/side"),
        ),
      ],
    ),
    record([
      field(
        "handstand",
        "Handstand best hold and successful attempts",
        "Best hold · successful attempts",
      ),
      field(
        "hspu",
        "HSPU variation, range, and reps",
        "Variation · range · reps",
      ),
      field(
        "muscle-up",
        "Muscle-up assistance and clean reps",
        "Assistance · clean reps",
      ),
      field("high-pull", "High-pull target when using the fallback", "Target"),
      field("pull-up", "Pull-up load and reps", "Load · sets × reps"),
      field("row-push", "Row and push result", "Variation · load · reps", {
        previousFieldIds: ["row-dip"],
      }),
      field(
        "upper-joint-response",
        "Wrist, shoulder, or elbow response",
        "None or movement and response",
      ),
      field(
        "notes",
        "Optional note",
        "Anything that should guide the next cycle",
      ),
    ]),
  ],
}

const levelThreeConditioning = {
  levelNumber: 3,
  emphasisNumber: 3,
  emphasis: "Conditioning",
  title: "Integrated Full-Body Expression",
  summary:
    "Connect familiar ground, pull, kettlebell, push, carry, and range work at a repeatable effort.",
  durationMinutes: 52,
  focus: ["Handstand balance", "Full-body integration", "Carries", "Pancake"],
  movementPatterns: [
    "vertical pull",
    "horizontal push",
    "squat",
    "hinge",
    "one-leg work",
    "trunk control",
    "carry",
    "locomotion",
    "impact or landing",
  ],
  equipment: ["Pull-up bar", "Kettlebells", "Rings", "Box", "Open floor"],
  content: [
    section(
      "conditioning-preparation",
      "preparation",
      "Preparation — 2 rounds · about 6 minutes",
      [
        movement(
          "low-skip",
          "Low skip or march to calf raise",
          same("20 seconds"),
        ),
        movement("shinbox-to-stand", "Shinbox to stand", same("4/side"), {
          scaling: [
            "Use hand support or a smaller shinbox transition when the knee pinches",
          ],
        }),
        movement("inchworm-push-up", "Inchworm push-up", same("4 reps")),
        movement("bear-crawl", "Bear crawl", same("10 metres")),
      ],
    ),
    section(
      "conditioning-handstand",
      "skill",
      "Handstand balance — 6–8 minutes",
      [
        movement(
          "handstand-balance",
          "Handstand balance practice",
          [
            "6 fresh freestanding attempts with a wall balance fallback",
            "8 fresh freestanding attempts with a wall balance fallback",
            "8 attempts at the strongest repeatable setup",
            "5 measured attempts; record the best hold",
          ],
          {
            notes: ["No HSPU work in Conditioning"],
            scaling: ["Keep every earlier wall-balance fallback available"],
          },
        ),
      ],
    ),
    section(
      "conditioning-circuit-a",
      "conditioning",
      "Circuit A — ground strength and vertical pull",
      [
        movement("turkish-get-up", "Turkish get-up", same("1/side"), {
          scaling: ["Use the half Turkish get-up from Level 2"],
        }),
        movement(
          "strict-pull-up",
          "Strict or lightly weighted pull-up",
          same("3–5 with at least 3 good reps available"),
          {
            scaling: ["Use strict bodyweight pull-ups"],
          },
        ),
      ],
      {
        prescriptions: [
          "2 rounds at effort 6–7 out of 10",
          "3 rounds",
          "3 rounds; add load to the kettlebell complex or carry, not both",
          "Repeat the Week 11 setup at the same or lower effort",
        ],
      },
    ),
    section(
      "conditioning-circuit-b",
      "conditioning",
      "Circuit B — kettlebell complex and horizontal push",
      [
        movement(
          "kettlebell-clean-front-squat",
          "Single-kettlebell clean plus front squat",
          same("4/side"),
          {
            scaling: [
              "Use a dead-stop swing plus goblet squat when the clean is not reliable",
            ],
          },
        ),
        movement("push-up", "Ring or floor push-up", same("8 reps"), {
          scaling: ["Raise the hands or reduce ring instability"],
        }),
      ],
      {
        prescriptions: ["2 rounds", "3 rounds", "3 rounds", "Repeat Week 11"],
      },
    ),
    section(
      "conditioning-circuit-c",
      "conditioning",
      "Circuit C — carry, step or landing, and light pancake",
      [
        movement(
          "double-front-rack-carry",
          "Double-front-rack carry",
          same("20–30 metres"),
        ),
        movement(
          "step-or-landing",
          "Fast step-up or low landing stick",
          same("5/side step-ups or 3 landing sticks"),
          {
            scaling: [
              "Use the step-up by default and only land when the knee is calm",
            ],
          },
        ),
        movement(
          "supported-pancake-hold",
          "Supported pancake hold",
          same("30 seconds"),
          {
            scaling: [
              "Use any earlier seat height that preserves an upright torso",
            ],
          },
        ),
      ],
      {
        prescriptions: ["2 rounds", "2 rounds", "2 rounds", "Repeat Week 11"],
      },
    ),
    section(
      "conditioning-decompression",
      "decompression",
      "Decompression — 5–7 minutes",
      [
        movement(
          "supported-cossack-squat",
          "Supported Cossack squat",
          same("5/side"),
        ),
        movement(
          "straddle-compression-lift",
          "Straddle compression lift",
          same("5/side"),
        ),
        movement(
          "pancake-breathing",
          "Best supported pancake breathing",
          same("30 seconds"),
        ),
        movement("easy-walk", "Easy walk with long exhales", same("2 minutes")),
      ],
    ),
    record([
      field("handstand", "Handstand result", "Best hold · successful attempts"),
      field("circuit-rounds", "Circuit rounds", "A · B · C"),
      field("circuit-loads", "Circuit loads", "Get-up · complex · carry"),
      field(
        "clean-fallback",
        "Clean variation or fallback",
        "Clean or dead-stop swing plus goblet squat",
      ),
      field("pull-push", "Pull-up and push-up variations", "Variations · reps"),
      field("step-landing", "Step or landing choice", "Variation · height"),
      field(
        "right-knee-response",
        "Right-knee response",
        "None · modified · sharp pinch and movement",
      ),
      field("session-effort", "Session effort", "1–10"),
      field(
        "notes",
        "Optional note",
        "Anything that should guide the next cycle",
      ),
    ]),
  ],
}

/** @type {any[]} The audit script validates this JavaScript data at runtime. */
export const builtToMoveDefinitions = [
  levelOneLower,
  levelOneUpper,
  levelOneConditioning,
  levelTwoLower,
  levelTwoUpper,
  levelTwoConditioning,
  levelThreeLower,
  levelThreeUpper,
  levelThreeConditioning,
]
