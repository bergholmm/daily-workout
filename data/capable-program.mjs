const youtubeSearch = (movement) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(movement)}`

const move = (movement, prescription) =>
  `[${movement}](${youtubeSearch(movement)})${prescription ? ` — ${prescription}` : ""}`

const section = (title, exercises) => ({ title, exercises })

const lowerPreparation = [
  move("Ankle rock", "8/side"),
  move("Shinbox switch", "6/side"),
  move("Alternating dragon lunge", "5/side"),
  move("Squat pry", "30 seconds"),
  move("Tempo bodyweight squat", "8 reps with a 3-second descent"),
]

const lowerDecompression = [
  move("Supported relaxed pancake stretch", "60 seconds"),
  move("Half-kneeling hip flexor stretch", "45 seconds/side"),
  move("Supine hamstring stretch with strap", "45 seconds/side"),
  move("Legs-elevated breathing", "60 seconds of slow nasal breathing"),
]

const upperPreparation = [
  move("Wrist rock", "10 reps"),
  move("Scapular push-up", "8 reps"),
  move("Scapular pull-up", "6 reps"),
  move("Hollow body hold", "20 seconds"),
  move("Arch body hold", "20 seconds"),
]

const upperDecompression = [
  move("Passive dead hang", "45 seconds or 2 × 20 seconds"),
  move("Child's pose side reach", "30 seconds/side"),
  move("Supine twist", "30 seconds/side"),
  move("Crocodile breathing", "60 seconds of slow nasal breathing"),
]

const conditioningPreparation = [
  move("Bear crawl", "10 m forward and backward"),
  move("Shinbox switch", "6/side"),
  move("World's greatest stretch", "4/side"),
  move("Inchworm", "5 reps"),
  move("Easy row", "2 minutes, gradually building pace"),
]

const conditioningDecompression = [
  move("90/90 breathing", "45 seconds/side"),
  move("Supported child's pose", "60 seconds"),
  move("Supine hamstring stretch with strap", "30 seconds/side"),
  move("Legs-elevated breathing", "60 seconds of slow nasal breathing"),
]

function lowerWorkout({
  week,
  title,
  summary,
  focus,
  equipment = ["Barbell", "Rack", "Bench or box", "Dumbbells"],
  range,
  primaryTitle,
  primary,
  accessory,
  endRange,
  scaling,
  record,
  durationMinutes = 58,
}) {
  return {
    weekNumber: week,
    sessionNumber: 1,
    dayType: "Lower",
    title,
    summary,
    durationMinutes,
    focus,
    equipment,
    content: [
      section("Preparation — 2 rounds", lowerPreparation),
      section("Range preparation — 3 rounds", range),
      section(primaryTitle, primary),
      section("Unilateral and posterior strength — 3 rounds", accessory),
      section("End-range strength — 2–3 rounds", endRange),
      section("Decompression — 5 minutes", lowerDecompression),
      section("Scaling", scaling),
      section("Record", record),
    ],
  }
}

function upperWorkout({
  week,
  title,
  summary,
  focus,
  equipment = ["Pull-up bar", "Wall", "Rings", "Dumbbells"],
  handstand,
  primarySkillTitle,
  primarySkill,
  secondarySkillTitle,
  secondarySkill,
  strength,
  resilience,
  range,
  scaling,
  record,
  durationMinutes = 60,
}) {
  return {
    weekNumber: week,
    sessionNumber: 2,
    dayType: "Upper",
    title,
    summary,
    durationMinutes,
    focus,
    equipment,
    content: [
      section("Preparation — 2 rounds", upperPreparation),
      section("Handstand — 8 minutes", handstand),
      section(primarySkillTitle, primarySkill),
      section(secondarySkillTitle, secondarySkill),
      section("Upper-body strength — 4 rounds", strength),
      section("Shoulder resilience — 2 rounds", resilience),
      section("Active shoulder range — 2 rounds", range),
      section("Decompression — 5 minutes", upperDecompression),
      section("Scaling", scaling),
      section("Record", record),
    ],
  }
}

function conditioningWorkout({
  week,
  title,
  summary,
  focus,
  equipment = ["Rower", "Kettlebell", "Dumbbells", "Open floor"],
  preparation = conditioningPreparation,
  capacityTitle,
  capacity,
  resilience,
  range,
  scaling,
  record,
  durationMinutes = 55,
}) {
  return {
    weekNumber: week,
    sessionNumber: 3,
    dayType: "Conditioning",
    title,
    summary,
    durationMinutes,
    focus,
    equipment,
    content: [
      section("Preparation — 2 rounds", preparation),
      section(capacityTitle, capacity),
      section("Resilience — 3 rounds", resilience),
      section("Full-body range — 2 rounds", range),
      section("Decompression — 5 minutes", conditioningDecompression),
      section("Scaling", scaling),
      section("Record", record),
    ],
  }
}

export const capableProgram = {
  name: "CAPABLE",
  slug: "capable",
  description:
    "A self-paced 12-week program for strength, flexibility, and longevity through focused Lower, Upper, and Conditioning sessions.",
  durationWeeks: 12,
  phases: [
    {
      number: 1,
      name: "Range & Control",
      weeks: [1, 2, 3, 4],
      description:
        "Establish strong positions, reliable technique, and the mobility baselines that support the rest of the program.",
    },
    {
      number: 2,
      name: "Strength Through Range",
      weeks: [5, 6, 7, 8],
      description:
        "Add meaningful load and harder skill progressions without sacrificing control or usable range.",
    },
    {
      number: 3,
      name: "Capacity & Expression",
      weeks: [9, 10, 11, 12],
      description:
        "Express strength and movement quality under greater load, complexity, and sustainable fatigue.",
    },
  ],
}

export const capableWorkouts = [
  // Phase 1 — Range & Control
  lowerWorkout({
    week: 1,
    title: "Squat Foundation + Pancake Base",
    summary:
      "Establish foundational squat strength while building active control through the hips, hamstrings, and adductors.",
    focus: ["Squat strength", "Pancake", "Hip control"],
    range: [
      move("Supported Cossack squat", "5/side with a slow descent"),
      move("Elevated straddle good morning", "6 slow reps"),
      move("Straddle leg lift", "5/side"),
    ],
    primaryTitle: "Primary strength — 4 sets",
    primary: [
      move("Back squat", "5 reps @ RPE 7"),
      "Rest 2–3 minutes; finish every set with about 3 good reps available",
    ],
    accessory: [
      move("Rear-foot-elevated split squat", "6/side @ RPE 7"),
      move("Single-leg Romanian deadlift", "8/side"),
      "Rest 60–90 seconds between rounds",
    ],
    endRange: [
      move("Elevated straddle good morning", "6 reps with a light load"),
      move("Supported pancake hold", "30–45 seconds"),
      move("Long-lunge hip flexor isometric", "20 seconds/side"),
    ],
    scaling: [
      `${move("Goblet squat", "4 × 6")} instead of the back squat`,
      `Hold a rack during the ${move("Supported Cossack squat", "and reduce depth as needed")}`,
      "Raise the straddle seat until you can begin with an upright torso",
    ],
    record: [
      "Back-squat load and final-set RPE",
      "Split-squat load",
      "Cossack depth or support used",
      "Straddle seat elevation",
    ],
  }),
  upperWorkout({
    week: 1,
    title: "Lines, Pulling Shapes + Transition Control",
    summary:
      "Build the handstand line, introduce the bar muscle-up transition, and establish a controlled front-lever tuck.",
    focus: ["Handstand", "Bar muscle-up", "Front lever"],
    handstand: [
      move("Chest-to-wall handstand", "4 × 20–30 seconds"),
      move("Wall handstand shoulder shrug", "3 × 5 reps"),
      "Rest 45–60 seconds; keep ribs controlled and push tall",
    ],
    primarySkillTitle: "Bar muscle-up skill — 10 minutes",
    primarySkill: [
      move("Hollow arch swing", "3 × 5 controlled cycles"),
      move("Low-bar muscle-up transition", "4 × 3 reps with foot assistance"),
      move("Straight bar dip", "3 × 5 reps"),
    ],
    secondarySkillTitle: "Front lever support — 6 minutes",
    secondarySkill: [
      move("Tuck front lever hold", "4 × 6–10 seconds"),
      "Rest 45–60 seconds; stop before the hips drop",
    ],
    strength: [
      move("Chin-up", "5 reps; add load only if all reps are clean"),
      move("Half-kneeling dumbbell press", "6/side @ RPE 7"),
      "Rest 90 seconds between rounds",
    ],
    resilience: [
      move("Ring support hold", "20 seconds"),
      move("Ring face pull", "10 reps"),
    ],
    range: [
      move("Skin the cat partial", "3 slow reps within a comfortable range"),
      move("Wall shoulder flexion lift-off", "6 reps"),
    ],
    scaling: [
      `${move("Box pike hold", "20–30 seconds")} instead of the wall handstand`,
      `Use ${move("Band-assisted chin-up", "5 reps")} or controlled negatives`,
      `Perform the ${move("Tuck front lever hold", "with feet lightly supported")}`,
    ],
    record: [
      "Best controlled handstand hold",
      "Muscle-up transition assistance",
      "Best tuck front-lever hold",
      "Chin-up load or assistance",
    ],
  }),
  conditioningWorkout({
    week: 1,
    title: "Sustainable Full-Body Baseline",
    summary:
      "Establish a repeatable conditioning baseline while keeping movement quality consistent from start to finish.",
    focus: ["Aerobic capacity", "Carries", "Movement quality"],
    capacityTitle: "Capacity benchmark — 20-minute AMRAP",
    capacity: [
      move("Row", "250 m at a sustainable pace"),
      move("Kettlebell deadlift", "10 reps"),
      move("Push-up", "8 reps"),
      move("Goblet reverse lunge", "6/side"),
      "Keep the final round technically similar to the first; target RPE 6–7",
    ],
    resilience: [
      move("Suitcase carry", "30 m/side"),
      move("Tibialis raise", "15 reps"),
      move("Dead bug", "6/side with a full exhale"),
    ],
    range: [
      move("Cossack squat", "5/side"),
      move("Quadruped thoracic rotation", "6/side"),
    ],
    scaling: [
      `Use a 60-second ${move("Bike erg", "easy-moderate effort")} instead of rowing`,
      `${move("Incline push-up", "8 reps")} can replace floor push-ups`,
      "Choose loads that allow continuous movement without rushing",
    ],
    record: [
      "Rounds plus reps completed",
      "Rower pace or calories",
      "Kettlebell and lunge loads",
      "Session RPE",
    ],
  }),

  lowerWorkout({
    week: 2,
    title: "Hinge Foundation + Hamstring Control",
    summary:
      "Develop a strong hip hinge and teach the hamstrings to produce force at longer muscle lengths.",
    focus: ["Hinge strength", "Hamstrings", "Single-leg control"],
    range: [
      move("Adductor rock back", "8/side"),
      move("Dowel hip hinge", "8 reps"),
      move("Elevated pike compression lift", "6 reps"),
    ],
    primaryTitle: "Primary strength — 4 sets",
    primary: [
      move("Romanian deadlift", "6 reps @ RPE 7"),
      "Rest 2 minutes; keep the bar close and stop before spinal position changes",
    ],
    accessory: [
      move("Front-foot-elevated split squat", "7/side"),
      move("Slider leg curl", "8 reps with a slow extension"),
      "Rest 60–90 seconds between rounds",
    ],
    endRange: [
      move("Elevated pike good morning", "6 slow reps with a light load"),
      move("Standing hamstring end-range isometric", "20 seconds/side"),
      move("Seated pike compression lift", "6 reps"),
    ],
    scaling: [
      `${move("Kettlebell Romanian deadlift", "4 × 8")} instead of the barbell variation`,
      `Use a shorter range for the ${move("Slider leg curl", "while keeping hips lifted")}`,
      "Raise the pike seat or bend the knees enough to keep the spine long",
    ],
    record: [
      "Romanian-deadlift load and final-set RPE",
      "Split-squat load",
      "Pike seat elevation",
      "Hamstring isometric position",
    ],
  }),
  upperWorkout({
    week: 2,
    title: "Balance Entries + Lever Foundations",
    summary:
      "Introduce controlled handstand entries while making the front lever the primary pulling skill.",
    focus: ["Handstand", "Front lever", "Dip strength"],
    handstand: [
      move("Chest-to-wall handstand", "3 × 25–35 seconds"),
      move("Handstand heel pull", "4 × 3 controlled attempts"),
      "Use the wall to find balance rather than kicking away from it",
    ],
    primarySkillTitle: "Front lever skill — 10 minutes",
    primarySkill: [
      move("Tuck front lever hold", "5 × 8–12 seconds"),
      move("Tuck front lever row", "4 × 4 reps"),
      "Rest until the next set can match the first position",
    ],
    secondarySkillTitle: "Bar muscle-up support — 6 minutes",
    secondarySkill: [
      move("Chest-to-bar pull-up", "4 × 3 explosive reps"),
      move("Straight bar dip", "3 × 5 reps"),
    ],
    strength: [
      move("Parallel bar dip", "5 reps @ RPE 7"),
      move("Ring row", "8 reps with a 2-second top hold"),
      "Rest 90 seconds between rounds",
    ],
    resilience: [
      move("Scapular pull-up", "8 reps"),
      move("Side-lying dumbbell external rotation", "10/side"),
    ],
    range: [
      move("German hang", "3 × 20 seconds with feet supported as needed"),
      move("Prone shoulder flexion lift", "6 reps"),
    ],
    scaling: [
      `${move("Box pike heel pull", "4 × 3 reps")} instead of the wall balance drill`,
      `Use ${move("Band-assisted chest-to-bar pull-up", "4 × 3 reps")}`,
      `Keep feet on the floor during the ${move("German hang", "and control the depth")}`,
    ],
    record: [
      "Best handstand heel-pull balance",
      "Front-lever progression and hold time",
      "Chest-to-bar assistance",
      "Dip load or assistance",
    ],
  }),
  conditioningWorkout({
    week: 2,
    title: "Controlled Intervals + Locomotion",
    summary:
      "Build aerobic power through repeatable intervals, then reinforce crawling, grip, and trunk control.",
    focus: ["Aerobic power", "Locomotion", "Grip"],
    capacityTitle: "Intervals — 5 × 3 minutes",
    capacity: [
      move("Bike erg", "3 minutes @ RPE 7"),
      "Rest 90 seconds between efforts",
      "Keep output within 5% across all five intervals",
    ],
    resilience: [
      move("Bear crawl", "15 m forward and backward"),
      move("Farmer carry", "40 m"),
      move("Side plank", "25 seconds/side"),
    ],
    range: [
      move("Shinbox get-up", "5/side"),
      move("Downward dog pedal", "8/side"),
    ],
    scaling: [
      `Use a ${move("Rower", "3-minute interval")} if no bike is available`,
      `Shorten the ${move("Bear crawl", "distance before posture deteriorates")}`,
      "Reduce interval intensity before reducing the number of intervals",
    ],
    record: [
      "Calories or distance for each interval",
      "Highest-to-lowest output difference",
      "Carry load",
      "Session RPE",
    ],
  }),

  lowerWorkout({
    week: 3,
    title: "Front Squat + Lateral Strength",
    summary:
      "Build upright squat strength and expand usable lateral range before the phase-one consolidation week.",
    focus: ["Front squat", "Adductors", "Lateral control"],
    range: [
      move("Supported Cossack squat", "6/side, slightly deeper than Week 1"),
      move("Elevated straddle good morning", "7 slow reps"),
      move("Straddle leg lift", "6/side"),
    ],
    primaryTitle: "Primary strength — 5 sets",
    primary: [
      move("Front squat", "4 reps @ RPE 7–7.5"),
      "Rest 2–3 minutes; maintain the same upright position across all sets",
    ],
    accessory: [
      move("Lateral lunge", "6/side with a 2-second pause"),
      move("Dumbbell Romanian deadlift", "8 reps"),
      "Rest 60–90 seconds between rounds",
    ],
    endRange: [
      move("Weighted Cossack squat", "5/side with a light counterbalance"),
      move("Loaded elevated pancake good morning", "6 slow reps"),
      move("Straddle compression hold", "15 seconds"),
    ],
    scaling: [
      `${move("Double-dumbbell front squat", "5 × 4")} instead of the barbell front squat`,
      `Keep the ${move("Lateral lunge", "shallow enough to control the return")}`,
      "Retain the Week 1 straddle seat height if the spine rounds",
    ],
    record: [
      "Front-squat load and final-set RPE",
      "Lateral-lunge load and depth",
      "Pancake load and seat elevation",
      "Straddle compression time",
    ],
  }),
  upperWorkout({
    week: 3,
    title: "Handstand Shifts + Explosive Pulling",
    summary:
      "Add controlled weight shifts upside down and develop the height required for a future bar muscle-up.",
    focus: ["Handstand", "Bar muscle-up", "Pulling power"],
    handstand: [
      move("Chest-to-wall handstand weight shift", "4 × 6 shifts"),
      move("Wall handstand toe pull", "4 × 3 attempts"),
      "Keep shoulders elevated and shift only as far as you can control",
    ],
    primarySkillTitle: "Bar muscle-up skill — 10 minutes",
    primarySkill: [
      move("Explosive chest-to-bar pull-up", "5 × 3 reps"),
      move(
        "Low-bar muscle-up transition",
        "4 × 3 reps with less foot assistance",
      ),
      move("Straight bar dip", "3 × 6 reps"),
    ],
    secondarySkillTitle: "Front lever support — 6 minutes",
    secondarySkill: [
      move("Tuck front lever row", "4 × 5 reps"),
      "Pause briefly at the top without losing the hollow position",
    ],
    strength: [
      move("Weighted pull-up", "4 reps @ RPE 7"),
      move("Dumbbell bench press", "7 reps @ RPE 7"),
      "Rest 90–120 seconds between rounds",
    ],
    resilience: [
      move("Ring support turn out", "15–20 seconds"),
      move("Prone Y raise", "8 reps"),
    ],
    range: [
      move("Skin the cat partial", "4 slow reps"),
      move("Wall shoulder extension stretch", "30 seconds"),
    ],
    scaling: [
      `${move("Box pike weight shift", "4 × 6 shifts")} instead of the handstand variation`,
      `Use ${move("Band-assisted explosive pull-up", "5 × 3 reps")} and prioritize height`,
      `${move("Bodyweight pull-up", "4 reps")} can replace weighted pull-ups`,
    ],
    record: [
      "Best wall-balance moment",
      "Highest clean pulling point",
      "Transition assistance",
      "Weighted pull-up load",
    ],
  }),
  conditioningWorkout({
    week: 3,
    title: "Mixed Modal Durability",
    summary:
      "Sustain steady output across cyclical work, loaded legs, pushing, pulling, and carries.",
    focus: ["Work capacity", "Full-body endurance", "Carries"],
    capacityTitle: "Capacity — 24-minute AMRAP",
    capacity: [
      move("Row", "300 m"),
      move("Kettlebell swing", "12 reps"),
      move("Goblet squat", "10 reps"),
      move("Ring row", "8 reps"),
      move("Farmer carry", "30 m"),
      "Work at RPE 6–7 and avoid sprinting the first two rounds",
    ],
    resilience: [
      move("Single-leg calf raise", "12/side"),
      move("Copenhagen plank short lever", "20 seconds/side"),
      move("Bird dog row", "6/side"),
    ],
    range: [
      move("Deep squat breathing", "5 slow breaths"),
      move("Thread the needle", "6/side"),
    ],
    scaling: [
      `${move("Kettlebell deadlift", "12 reps")} can replace swings`,
      `${move("Incline ring row", "8 reps")} should allow an unbroken set`,
      "Reduce loading before reducing range of motion",
    ],
    record: [
      "Rounds plus reps completed",
      "Loads used",
      "Whether every movement stayed unbroken",
      "Session RPE",
    ],
  }),

  lowerWorkout({
    week: 4,
    title: "Lower Consolidation + Range Check",
    summary:
      "Reduce volume, repeat the foundational patterns, and record a clean phase-one range baseline.",
    focus: ["Consolidation", "Squat technique", "Range benchmark"],
    range: [
      move("Supported Cossack squat", "5/side at your best controlled depth"),
      move("Elevated straddle good morning", "6 slow reps"),
      move("Straddle leg lift", "5/side"),
    ],
    primaryTitle: "Primary strength — 3 sets",
    primary: [
      move("Back squat", "5 reps @ RPE 6–7"),
      "Use a crisp load; this is not a maximal test",
    ],
    accessory: [
      move("Rear-foot-elevated split squat", "5/side, two rounds only"),
      move("Single-leg Romanian deadlift", "6/side, two rounds only"),
      "Rest 60–90 seconds between rounds",
    ],
    endRange: [
      move(
        "Supported pancake hold",
        "45 seconds at the lowest controllable seat height",
      ),
      move("Standing hamstring end-range isometric", "20 seconds/side"),
    ],
    scaling: [
      `${move("Goblet squat", "3 × 6")} instead of back squats`,
      `Use support during the ${move("Single-leg Romanian deadlift", "to make the position repeatable")}`,
      "Do not lower the straddle seat if an upright start is lost",
    ],
    record: [
      "Back-squat load and RPE",
      "Best controlled Cossack depth",
      "Lowest upright straddle seat elevation",
      "Comparison with Week 1",
    ],
    durationMinutes: 52,
  }),
  upperWorkout({
    week: 4,
    title: "Upper Consolidation + Skill Check",
    summary:
      "Lower the volume and record clean, submaximal benchmarks for all three gymnastics skills.",
    focus: ["Consolidation", "Handstand", "Skill benchmark"],
    handstand: [
      move("Chest-to-wall handstand", "3 × 20 seconds"),
      move("Wall handstand toe pull", "5 controlled balance attempts"),
      "Stop each attempt before the line deteriorates",
    ],
    primarySkillTitle: "Skill benchmark — 10 minutes",
    primarySkill: [
      move("Explosive chest-to-bar pull-up", "3 × 3 reps"),
      move("Low-bar muscle-up transition", "3 × 3 reps"),
      move("Tuck front lever hold", "3 × one clean submaximal hold"),
    ],
    secondarySkillTitle: "Technique support — 5 minutes",
    secondarySkill: [
      move("Straight bar dip", "2 × 5 reps"),
      move("Tuck front lever row", "2 × 4 reps"),
    ],
    strength: [
      move("Chin-up", "5 reps, three rounds only @ RPE 6–7"),
      move("Half-kneeling dumbbell press", "6/side, three rounds only"),
      "Rest 90 seconds between rounds",
    ],
    resilience: [
      move("Ring support hold", "15 seconds"),
      move("Ring face pull", "8 reps"),
    ],
    range: [
      move("German hang", "2 × 20 seconds with comfortable support"),
      move("Wall shoulder flexion lift-off", "5 reps"),
    ],
    scaling: [
      `${move("Box pike hold", "3 × 20 seconds")} can replace wall handstands`,
      "Use the same skill regressions as Weeks 1–3 so the comparison is meaningful",
      "Keep every benchmark submaximal and technically clean",
    ],
    record: [
      "Best controlled handstand balance",
      "Pulling height and transition assistance",
      "Front-lever progression and hold time",
      "Comparison with Week 1",
    ],
    durationMinutes: 54,
  }),
  conditioningWorkout({
    week: 4,
    title: "Aerobic Consolidation + Recovery",
    summary:
      "Absorb the first phase with easy cyclical work, resilient movement, and an unhurried range session.",
    focus: ["Recovery", "Aerobic base", "Movement quality"],
    capacityTitle: "Easy capacity — 16 minutes",
    capacity: [
      move("Row", "2 minutes easy"),
      move("Goblet squat", "8 light reps"),
      move("Incline push-up", "8 reps"),
      move("Suitcase carry", "20 m/side"),
      "Repeat smoothly at RPE 5–6; nasal breathing when practical",
    ],
    resilience: [
      move("Tibialis raise", "12 reps"),
      move("Dead bug", "5/side"),
      move("Bear crawl", "10 m easy"),
    ],
    range: [
      move("Shinbox flow", "5/side"),
      move("Supported deep squat breathing", "5 breaths"),
    ],
    scaling: [
      `Use an easy ${move("Bike erg", "2-minute effort")} instead of rowing`,
      "Use very light loads and finish feeling better than you started",
      "Shorten the session if accumulated fatigue remains high",
    ],
    record: [
      "Average heart rate if available",
      "Session RPE",
      "Recovery notes",
    ],
    durationMinutes: 48,
  }),

  // Phase 2 — Strength Through Range
  lowerWorkout({
    week: 5,
    title: "Deadlift Strength + Deep Split Positions",
    summary:
      "Begin the build phase with heavier hinging and controlled strength through a longer split-squat range.",
    focus: ["Deadlift", "Split squat", "Hip extension"],
    range: [
      move("Front-foot-elevated split squat pulse", "6/side"),
      move("Adductor rock back", "8/side"),
      move("Elevated pike compression lift", "7 reps"),
    ],
    primaryTitle: "Primary strength — 4 sets",
    primary: [
      move("Conventional deadlift", "5 reps @ RPE 7"),
      "Rest 2–3 minutes and reset each rep from the floor",
    ],
    accessory: [
      move("Front-foot-elevated split squat", "6/side @ RPE 7–8"),
      move("Single-leg hip thrust", "8/side with a 2-second squeeze"),
      "Rest 75–90 seconds between rounds",
    ],
    endRange: [
      move("Loaded elevated pike good morning", "6 slow reps"),
      move("Long-lunge hip flexor isometric", "25 seconds/side"),
      move("Seated pike compression lift", "7 reps"),
    ],
    scaling: [
      `${move("Kettlebell deadlift", "4 × 6")} from an elevated start can replace deadlifts`,
      `Reduce elevation during the ${move("Front-foot-elevated split squat", "if pelvic control is lost")}`,
      "Use a bent-knee pike position if straight legs cause nerve-like tension",
    ],
    record: [
      "Deadlift load and final-set RPE",
      "Split-squat load and elevation",
      "Pike seat height and load",
      "Hip-flexor isometric quality",
    ],
  }),
  upperWorkout({
    week: 5,
    title: "Freestanding Entries + Lever Length",
    summary:
      "Introduce measured kick-up practice and extend the front-lever shape while maintaining muscle-up mechanics.",
    focus: ["Handstand entries", "Front lever", "Upper strength"],
    handstand: [
      move("Handstand kick-up", "8–10 controlled attempts"),
      move("Chest-to-wall handstand", "2 × 30 seconds for line reinforcement"),
      "Use a wall or spotter behind the kick-up when needed",
    ],
    primarySkillTitle: "Front lever skill — 10 minutes",
    primarySkill: [
      move("Advanced tuck front lever hold", "5 × 6–10 seconds"),
      move("Tuck front lever row", "4 × 5 reps with a longer body position"),
    ],
    secondarySkillTitle: "Bar muscle-up support — 6 minutes",
    secondarySkill: [
      move("Band-assisted bar muscle-up", "4 × 2–3 smooth reps"),
      move("Straight bar dip", "3 × 6 reps"),
    ],
    strength: [
      move("Weighted chin-up", "4 reps @ RPE 7–8"),
      move("Standing dumbbell overhead press", "6 reps @ RPE 7"),
      "Rest 90–120 seconds between rounds",
    ],
    resilience: [
      move("Ring support turn out", "20 seconds"),
      move("Band external rotation", "12 reps"),
    ],
    range: [
      move("German hang", "3 × 20–30 seconds"),
      move("Prone shoulder flexion lift", "7 reps"),
    ],
    scaling: [
      `${move("Wall-facing handstand kick-up", "controlled attempts")} can replace freestanding entries`,
      `Use a compact ${move("Tuck front lever hold", "instead of advanced tuck")}`,
      `Increase assistance on the ${move("Band-assisted bar muscle-up", "until the transition is smooth")}`,
    ],
    record: [
      "Best kick-up balance time",
      "Front-lever progression and hold time",
      "Muscle-up band used",
      "Weighted chin-up load",
    ],
  }),
  conditioningWorkout({
    week: 5,
    title: "Carry, Crawl + Climb",
    summary:
      "Build practical work capacity through loaded carries, crawling, step-ups, and repeatable cyclical efforts.",
    focus: ["Loaded capacity", "Locomotion", "Trunk endurance"],
    capacityTitle: "Capacity — 5 rounds at a steady pace",
    capacity: [
      move("Bike erg", "90 seconds @ RPE 7"),
      move("Dumbbell box step-up", "8/side"),
      move("Bear crawl", "15 m"),
      move("Farmer carry", "40 m"),
      "Rest 60 seconds; keep round times within 10%",
    ],
    resilience: [
      move("Copenhagen plank short lever", "25 seconds/side"),
      move("Single-leg calf raise", "15/side"),
      move("Pallof press", "8/side"),
    ],
    range: [move("Cossack squat", "6/side"), move("Crab reach", "5/side")],
    scaling: [
      `Lower the box for the ${move("Dumbbell box step-up", "and keep the full foot supported")}`,
      `Use a lighter ${move("Farmer carry", "that preserves tall posture")}`,
      `${move("Incline bear crawl", "15 m")} can reduce wrist loading`,
    ],
    record: [
      "Round times",
      "Step-up and carry loads",
      "Bike output",
      "Session RPE",
    ],
  }),

  lowerWorkout({
    week: 6,
    title: "Heavy Squat + Long-Range Hamstrings",
    summary:
      "Increase squat intensity and reinforce hamstring strength without giving up pelvic control.",
    focus: ["Back squat", "Hamstrings", "Pancake strength"],
    range: [
      move("Weighted Cossack squat", "5/side with a light counterbalance"),
      move("Elevated straddle good morning", "8 reps"),
      move("Straddle leg lift", "7/side"),
    ],
    primaryTitle: "Primary strength — 5 sets",
    primary: [
      move("Back squat", "4 reps @ RPE 7.5–8"),
      "Rest 2–3 minutes and keep one consistent depth",
    ],
    accessory: [
      move(
        "Rear-foot-elevated split squat",
        "6/side with more load than Week 1",
      ),
      move("Dumbbell Romanian deadlift", "8 reps with a 3-second descent"),
      "Rest 75–90 seconds between rounds",
    ],
    endRange: [
      move("Loaded elevated pancake good morning", "7 slow reps"),
      move("Straddle compression hold", "20 seconds"),
      move("Standing hamstring end-range isometric", "25 seconds/side"),
    ],
    scaling: [
      `${move("Box squat", "5 × 4")} can provide a repeatable target depth`,
      `Use hand support for the ${move("Weighted Cossack squat", "before adding load")}`,
      "Keep or raise the pancake seat if the load causes spinal rounding",
    ],
    record: [
      "Back-squat load and final-set RPE",
      "Split-squat load",
      "Pancake seat height and load",
      "Hamstring isometric position",
    ],
  }),
  upperWorkout({
    week: 6,
    title: "Handstand Balance + Assisted Muscle-Up",
    summary:
      "Accumulate short balance attempts and make the bar muscle-up transition increasingly specific.",
    focus: ["Handstand balance", "Bar muscle-up", "Dip strength"],
    handstand: [
      move("Handstand kick-up", "10–12 attempts"),
      move("Wall handstand toe pull", "3 × 3 controlled reps"),
      "Rest briefly between attempts so each entry is deliberate",
    ],
    primarySkillTitle: "Bar muscle-up skill — 12 minutes",
    primarySkill: [
      move("Explosive pull-up", "5 × 3 reps aiming toward the lower chest"),
      move("Band-assisted bar muscle-up", "5 × 2 reps"),
      move("Straight bar dip", "3 × 7 reps"),
    ],
    secondarySkillTitle: "Front lever support — 5 minutes",
    secondarySkill: [
      move("Advanced tuck front lever hold", "4 × 6–8 seconds"),
      "Use the hardest shape that remains horizontal",
    ],
    strength: [
      move("Weighted parallel bar dip", "4 reps @ RPE 7–8"),
      move("Chest-supported dumbbell row", "7 reps @ RPE 7"),
      "Rest 90–120 seconds between rounds",
    ],
    resilience: [
      move("Scapular pull-up", "8 reps"),
      move("Bottom-up kettlebell carry", "20 m/side"),
    ],
    range: [
      move("Skin the cat partial", "4 controlled reps"),
      move("Wall shoulder extension stretch", "35 seconds"),
    ],
    scaling: [
      `Use ${move("Chest-to-wall handstand", "4 × 25 seconds")} instead of kick-ups`,
      `Increase band assistance for the ${move("Band-assisted bar muscle-up", "and eliminate chicken-wing transitions")}`,
      `${move("Bodyweight parallel bar dip", "4 reps")} can replace weighted dips`,
    ],
    record: [
      "Best freestanding handstand time",
      "Highest explosive pull",
      "Muscle-up band used",
      "Dip load",
    ],
  }),
  conditioningWorkout({
    week: 6,
    title: "Short Power Intervals + Easy Volume",
    summary:
      "Touch higher intensity without turning the entire session into a maximal effort.",
    focus: ["Power intervals", "Aerobic recovery", "Trunk control"],
    capacityTitle: "Intervals — 8 × 45 seconds",
    capacity: [
      move("Rower sprint", "45 seconds @ RPE 8–9"),
      move("Easy row", "75 seconds recovery"),
      "Hold repeatable power; stop the interval if technique becomes frantic",
      move("Easy bike erg", "8 minutes immediately afterward @ RPE 5"),
    ],
    resilience: [
      move("Suitcase carry", "35 m/side"),
      move("Tall-kneeling cable chop", "8/side"),
      move("Tibialis raise", "15 reps"),
    ],
    range: [
      move("Half-kneeling windmill", "5/side"),
      move("Adductor rock back", "8/side"),
    ],
    scaling: [
      `${move("Bike erg sprint", "45 seconds")} can replace rowing`,
      "Use RPE 8 rather than chasing a specific pace",
      "Reduce to six intervals if power drops more than 10%",
    ],
    record: [
      "Output for all eight intervals",
      "Power drop-off",
      "Carry load",
      "Session RPE",
    ],
  }),

  lowerWorkout({
    week: 7,
    title: "Deadlift Power + Adductor Strength",
    summary:
      "Lift heavier from the floor and strengthen the lateral positions that support durable hips and knees.",
    focus: ["Deadlift", "Adductors", "Lateral strength"],
    range: [
      move("Cossack squat", "6/side at a controlled depth"),
      move("Frog rock back", "8 reps"),
      move("Seated straddle compression lift", "7/side"),
    ],
    primaryTitle: "Primary strength — 5 sets",
    primary: [
      move("Conventional deadlift", "3 reps @ RPE 8"),
      "Rest 2–3 minutes; no grinding or touch-and-go reps",
    ],
    accessory: [
      move("Lateral lunge", "7/side with load"),
      move("Slider leg curl", "9 reps"),
      "Rest 75–90 seconds between rounds",
    ],
    endRange: [
      move("Weighted Cossack squat", "5/side"),
      move("Loaded elevated pancake good morning", "8 slow reps"),
      move("Copenhagen plank long lever", "15–20 seconds/side"),
    ],
    scaling: [
      `${move("Trap bar deadlift", "5 × 3")} can replace conventional deadlifts`,
      `Use a shorter lever for the ${move("Copenhagen plank", "or keep the lower foot supported")}`,
      "Use counterbalance and hand support before loading Cossack depth",
    ],
    record: [
      "Deadlift load and final-set RPE",
      "Lateral-lunge load and depth",
      "Pancake seat height and load",
      "Copenhagen hold time",
    ],
  }),
  upperWorkout({
    week: 7,
    title: "Handstand Shape + Lever Rows",
    summary:
      "Hold a stronger freestanding line and turn front-lever positioning into dynamic pulling strength.",
    focus: ["Handstand", "Front lever", "Pulling strength"],
    handstand: [
      move("Handstand kick-up", "10 controlled attempts"),
      move("Freestanding handstand", "5 × one submaximal hold attempt"),
      "Use the wall if entries become inconsistent",
    ],
    primarySkillTitle: "Front lever skill — 12 minutes",
    primarySkill: [
      move("Advanced tuck front lever hold", "5 × 8–12 seconds"),
      move("Advanced tuck front lever row", "4 × 3–5 reps"),
      "Regress the shape before losing straight-arm shoulder control",
    ],
    secondarySkillTitle: "Bar muscle-up support — 5 minutes",
    secondarySkill: [
      move("Explosive chest-to-bar pull-up", "4 × 3 reps"),
      move("Low-bar muscle-up transition", "3 × 3 smooth reps"),
    ],
    strength: [
      move("Weighted pull-up", "4 reps @ RPE 8"),
      move("Dumbbell bench press", "6 reps @ RPE 7–8"),
      "Rest 90–120 seconds between rounds",
    ],
    resilience: [
      move("Ring support turn out", "20–25 seconds"),
      move("Ring face pull", "12 reps"),
    ],
    range: [
      move("German hang", "3 × 25 seconds"),
      move("Prone shoulder flexion lift", "8 reps"),
    ],
    scaling: [
      `Use ${move("Wall handstand toe pull", "5 × 3 reps")} in place of freestanding holds`,
      `Perform ${move("Tuck front lever row", "4 × 5 reps")} if advanced tuck breaks position`,
      `${move("Bodyweight pull-up", "4 reps")} can replace weighted pull-ups`,
    ],
    record: [
      "Best freestanding handstand hold",
      "Front-lever progression, hold, and row reps",
      "Explosive pulling height",
      "Weighted pull-up load",
    ],
  }),
  conditioningWorkout({
    week: 7,
    title: "Long Mixed Capacity",
    summary:
      "Build the longest sustainable effort of the build phase without sacrificing strength positions.",
    focus: ["Aerobic endurance", "Strength endurance", "Pacing"],
    capacityTitle: "Capacity — 25-minute continuous circuit",
    capacity: [
      move("Bike erg", "2 minutes @ RPE 6–7"),
      move("Kettlebell swing", "15 reps"),
      move("Dumbbell push press", "8 reps"),
      move("Walking lunge", "10/side"),
      move("Ring row", "10 reps"),
      "Move steadily and leave at least 2 reps in reserve on every set",
    ],
    resilience: [
      move("Farmer carry", "50 m"),
      move("Single-leg calf raise", "15/side"),
      move("Hollow body rock", "12 reps"),
    ],
    range: [
      move("Deep squat thoracic rotation", "5/side"),
      move("Crab reach", "6/side"),
    ],
    scaling: [
      `${move("Kettlebell deadlift", "15 reps")} can replace swings`,
      `${move("Single-arm dumbbell strict press", "6/side")} can replace push presses`,
      "Choose loads that keep every set technically unbroken",
    ],
    record: [
      "Rounds plus reps",
      "Loads used",
      "Average cyclical pace",
      "Session RPE",
    ],
  }),

  lowerWorkout({
    week: 8,
    title: "Lower Consolidation + Loaded Range",
    summary:
      "Keep intensity moderate, reduce total work, and confirm that added load has not reduced usable range.",
    focus: ["Consolidation", "Hinge technique", "Loaded mobility"],
    range: [
      move("Supported Cossack squat", "5/side"),
      move("Elevated straddle good morning", "6 reps"),
      move("Elevated pike compression lift", "6 reps"),
    ],
    primaryTitle: "Primary strength — 3 sets",
    primary: [
      move("Romanian deadlift", "5 reps @ RPE 6–7"),
      "Use a moderate load and finish each set sharply",
    ],
    accessory: [
      move("Front-foot-elevated split squat", "5/side, two rounds only"),
      move("Slider leg curl", "7 reps, two rounds only"),
      "Rest 60–90 seconds between rounds",
    ],
    endRange: [
      move("Loaded elevated pancake good morning", "6 reps with Week 6 load"),
      move("Supported pancake hold", "45 seconds"),
      move("Long-lunge hip flexor isometric", "20 seconds/side"),
    ],
    scaling: [
      `${move("Kettlebell Romanian deadlift", "3 × 7")} can replace the barbell`,
      "Use the same range regressions as the preceding build weeks",
      "Reduce load if Week 4 range positions cannot be matched",
    ],
    record: [
      "Romanian-deadlift load and RPE",
      "Split-squat range",
      "Pancake seat height and load",
      "Comparison with Week 4",
    ],
    durationMinutes: 52,
  }),
  upperWorkout({
    week: 8,
    title: "Upper Consolidation + Position Quality",
    summary:
      "Reduce pulling and pressing volume while rehearsing each skill at its cleanest current progression.",
    focus: ["Consolidation", "Skill quality", "Shoulder health"],
    handstand: [
      move("Handstand kick-up", "6–8 relaxed attempts"),
      move("Chest-to-wall handstand", "2 × 25 seconds"),
      "Prioritize a calm entry and exit over hold duration",
    ],
    primarySkillTitle: "Skill quality — 10 minutes",
    primarySkill: [
      move("Band-assisted bar muscle-up", "3 × 2 clean reps"),
      move("Advanced tuck front lever hold", "3 × 6–10 seconds"),
      "Use familiar assistance and finish well before failure",
    ],
    secondarySkillTitle: "Technique support — 4 minutes",
    secondarySkill: [
      move("Straight bar dip", "2 × 5 reps"),
      move("Tuck front lever row", "2 × 4 reps"),
    ],
    strength: [
      move("Chin-up", "4 reps, three rounds only @ RPE 6–7"),
      move("Standing dumbbell overhead press", "5 reps, three rounds only"),
      "Rest 90 seconds between rounds",
    ],
    resilience: [
      move("Scapular pull-up", "6 reps"),
      move("Band external rotation", "10 reps"),
    ],
    range: [
      move("German hang", "2 × 20 seconds"),
      move("Wall shoulder flexion lift-off", "5 reps"),
    ],
    scaling: [
      `${move("Box pike hold", "2 × 25 seconds")} can replace handstands`,
      "Return to the Phase 1 lever shape if shoulder position is less stable",
      "Use more assistance than usual and leave the session fresh",
    ],
    record: [
      "Best relaxed handstand attempt",
      "Muscle-up assistance",
      "Front-lever progression and hold",
      "Shoulder readiness after training",
    ],
    durationMinutes: 52,
  }),
  conditioningWorkout({
    week: 8,
    title: "Easy Capacity + Joint Reset",
    summary:
      "Consolidate the build phase with conversational conditioning and extra attention to joint-friendly movement.",
    focus: ["Recovery", "Easy conditioning", "Joint resilience"],
    capacityTitle: "Easy capacity — 18-minute EMOM",
    capacity: [
      move("Bike erg", "minute 1: 40 seconds easy"),
      move("Goblet reverse lunge", "minute 2: 6/side, light"),
      move("Ring row", "minute 3: 8 controlled reps"),
      "Repeat for six rounds at RPE 5–6",
    ],
    resilience: [
      move("Suitcase carry", "25 m/side"),
      move("Tibialis raise", "12 reps"),
      move("Dead bug", "5/side"),
    ],
    range: [
      move("Shinbox flow", "5/side"),
      move("Quadruped thoracic rotation", "5/side"),
    ],
    scaling: [
      `Use an easy ${move("Row", "40-second effort")} instead of the bike`,
      "Keep at least 15 seconds of rest in every minute",
      "The session should improve energy, not test fitness",
    ],
    record: [
      "Average heart rate if available",
      "Loads used",
      "Session RPE",
      "Recovery notes",
    ],
    durationMinutes: 48,
  }),

  // Phase 3 — Capacity & Expression
  lowerWorkout({
    week: 9,
    title: "Heavy Squat + Active Pancake",
    summary:
      "Express heavier squat strength and produce force from the deepest pancake positions you can control.",
    focus: ["Heavy squat", "Active pancake", "Unilateral strength"],
    range: [
      move("Weighted Cossack squat", "5/side"),
      move("Loaded elevated pancake good morning", "6 reps"),
      move("Straddle leg lift", "8/side"),
    ],
    primaryTitle: "Primary strength — 5 sets",
    primary: [
      move("Back squat", "3 reps @ RPE 8"),
      "Rest 2–3 minutes; every rep should move without grinding",
    ],
    accessory: [
      move("Rear-foot-elevated split squat", "5/side @ RPE 8"),
      move("Single-leg Romanian deadlift", "7/side with load"),
      "Rest 75–90 seconds between rounds",
    ],
    endRange: [
      move(
        "Loaded pancake good morning",
        "6 reps from the lowest upright seat",
      ),
      move("Straddle compression hold", "25 seconds"),
      move("Cossack squat isometric", "20 seconds/side"),
    ],
    scaling: [
      `${move("Box squat", "5 × 3")} can provide a consistent depth target`,
      `Use hand support during the ${move("Cossack squat isometric", "and stay above discomfort")}`,
      "Raise the pancake seat before reducing spinal position",
    ],
    record: [
      "Back-squat load and final-set RPE",
      "Split-squat load",
      "Lowest upright pancake seat and load",
      "Cossack isometric depth",
    ],
  }),
  upperWorkout({
    week: 9,
    title: "Freestanding Balance + Muscle-Up Attempts",
    summary:
      "Express the handstand line independently and begin low-volume bar muscle-up attempts with clean regressions ready.",
    focus: ["Freestanding handstand", "Bar muscle-up", "Upper strength"],
    handstand: [
      move("Handstand kick-up", "8 controlled entries"),
      move("Freestanding handstand", "6 submaximal attempts"),
      "Finish each attempt before balance turns into a save",
    ],
    primarySkillTitle: "Bar muscle-up skill — 12 minutes",
    primarySkill: [
      move("Bar muscle-up", "up to 5 clean singles with full rest"),
      move("Band-assisted bar muscle-up", "3 × 2 reps after attempts"),
      move("Straight bar dip", "3 × 6 reps"),
    ],
    secondarySkillTitle: "Front lever support — 6 minutes",
    secondarySkill: [
      move("Advanced tuck front lever hold", "4 × 8–12 seconds"),
      move("Advanced tuck front lever row", "3 × 3 reps"),
    ],
    strength: [
      move("Weighted chin-up", "3 reps @ RPE 8"),
      move("Standing dumbbell overhead press", "5 reps @ RPE 8"),
      "Rest 2 minutes between rounds",
    ],
    resilience: [
      move("Ring support turn out", "25 seconds"),
      move("Bottom-up kettlebell carry", "25 m/side"),
    ],
    range: [
      move("Skin the cat", "3 controlled reps within a pain-free range"),
      move("Prone shoulder flexion lift", "8 reps"),
    ],
    scaling: [
      `Use ${move("Wall handstand toe pull", "5 × 3 reps")} instead of freestanding holds`,
      `Skip unassisted attempts and use the ${move("Band-assisted bar muscle-up", "for all working reps")} if pulling height is insufficient`,
      "Return to compact tuck for front-lever quality",
    ],
    record: [
      "Best freestanding handstand hold",
      "Clean bar muscle-ups or band used",
      "Front-lever progression and hold",
      "Weighted chin-up load",
    ],
  }),
  conditioningWorkout({
    week: 9,
    title: "Four-Minute Repeatability",
    summary:
      "Express sustainable power across longer intervals while carrying strength into fatigued movement.",
    focus: ["Aerobic power", "Repeatability", "Loaded movement"],
    capacityTitle: "Intervals — 5 × 4 minutes",
    capacity: [
      move("Row", "2 minutes @ RPE 7–8"),
      move("Kettlebell front-rack reverse lunge", "6/side"),
      move("Push-up", "8 reps"),
      "Use the remaining time to row again; rest 90 seconds between intervals",
    ],
    resilience: [
      move("Farmer carry", "50 m heavy"),
      move("Copenhagen plank short lever", "30 seconds/side"),
      move("Single-leg calf raise", "15/side"),
    ],
    range: [
      move("Cossack squat", "6/side"),
      move("Half-kneeling windmill", "6/side"),
    ],
    scaling: [
      `${move("Incline push-up", "8 reps")} should stay unbroken`,
      `Use ${move("Goblet reverse lunge", "6/side")} if the front rack limits breathing`,
      "Reduce loading until every interval can follow the same plan",
    ],
    record: [
      "Row output for each interval",
      "Lunge load",
      "Push-up variation",
      "Session RPE",
    ],
  }),

  lowerWorkout({
    week: 10,
    title: "Heavy Pull + Single-Leg Range",
    summary:
      "Express deadlift strength and own deeper unilateral positions through controlled loading.",
    focus: ["Heavy deadlift", "Single-leg strength", "Hamstrings"],
    range: [
      move("Front-foot-elevated split squat pulse", "7/side"),
      move("Elevated pike good morning", "7 reps"),
      move("Seated pike compression lift", "8 reps"),
    ],
    primaryTitle: "Primary strength — 5 sets",
    primary: [
      move("Conventional deadlift", "3 reps @ RPE 8"),
      "Rest 2–3 minutes and keep all sets below grinding effort",
    ],
    accessory: [
      move("Front-foot-elevated split squat", "6/side @ RPE 8"),
      move("Slider leg curl", "10 reps"),
      "Rest 75–90 seconds between rounds",
    ],
    endRange: [
      move("Loaded pike good morning", "6 reps"),
      move("Standing hamstring end-range isometric", "30 seconds/side"),
      move("Long-lunge hip flexor isometric", "30 seconds/side"),
    ],
    scaling: [
      `${move("Trap bar deadlift", "5 × 3")} can replace conventional deadlifts`,
      `Reduce front-foot height for the ${move("Front-foot-elevated split squat", "until the pelvis stays level")}`,
      "Bend the knees during pike work if straight legs produce neural tension",
    ],
    record: [
      "Deadlift load and final-set RPE",
      "Split-squat load and elevation",
      "Pike load and range",
      "Hamstring isometric position",
    ],
  }),
  upperWorkout({
    week: 10,
    title: "Handstand Time + Front-Lever Expression",
    summary:
      "Accumulate quality freestanding time and express the longest front-lever shape you can hold without losing position.",
    focus: ["Handstand", "Front lever", "Straight-arm strength"],
    handstand: [
      move("Freestanding handstand", "8 quality attempts"),
      move("Chest-to-wall handstand", "2 × 30 seconds"),
      "Accumulate good balance time without chasing fatigued attempts",
    ],
    primarySkillTitle: "Front lever skill — 12 minutes",
    primarySkill: [
      move("Single-leg front lever hold", "5 × 5–8 seconds, alternating legs"),
      move("Advanced tuck front lever row", "4 × 4 reps"),
      "Use advanced tuck instead if the hips cannot remain level",
    ],
    secondarySkillTitle: "Bar muscle-up support — 6 minutes",
    secondarySkill: [
      move("Bar muscle-up", "3–5 clean singles or assisted singles"),
      move("Explosive chest-to-bar pull-up", "3 × 3 reps"),
    ],
    strength: [
      move("Weighted parallel bar dip", "3 reps @ RPE 8"),
      move("Chest-supported dumbbell row", "6 reps @ RPE 8"),
      "Rest 2 minutes between rounds",
    ],
    resilience: [
      move("Scapular pull-up", "8 reps"),
      move("Ring face pull", "12 reps"),
    ],
    range: [
      move("German hang", "3 × 30 seconds with support as needed"),
      move("Wall shoulder flexion lift-off", "8 reps"),
    ],
    scaling: [
      `Use ${move("Wall handstand toe pull", "6 × 3 reps")} instead of freestanding attempts`,
      `${move("Advanced tuck front lever hold", "5 × 8 seconds")} can replace the single-leg shape`,
      `Use ${move("Band-assisted bar muscle-up", "3–5 singles")} for smooth transitions`,
    ],
    record: [
      "Total quality freestanding handstand time",
      "Front-lever progression and hold time",
      "Clean or assisted muscle-up singles",
      "Dip load",
    ],
  }),
  conditioningWorkout({
    week: 10,
    title: "Power Repeat + Strength Endurance",
    summary:
      "Repeat short high-output efforts, then transition into deliberate full-body strength endurance.",
    focus: ["Power", "Strength endurance", "Recovery"],
    capacityTitle: "Power and capacity — two parts",
    capacity: [
      move("Bike erg sprint", "10 × 30 seconds hard / 60 seconds easy"),
      "Rest 3 minutes after the final interval",
      move("Goblet squat", "then 3 rounds of 10 reps"),
      move("Ring row", "10 reps"),
      move("Suitcase carry", "30 m/side"),
    ],
    resilience: [
      move("Tibialis raise", "15 reps"),
      move("Pallof press", "10/side"),
      move("Bear crawl", "15 m"),
    ],
    range: [move("Shinbox get-up", "6/side"), move("Crab reach", "6/side")],
    scaling: [
      `${move("Rower sprint", "10 × 30 seconds")} can replace bike sprints`,
      "Reduce hard efforts to RPE 8 if output drops sharply",
      "Use light loads during the strength-endurance rounds",
    ],
    record: [
      "Sprint output range",
      "Goblet and carry loads",
      "Round times",
      "Session RPE",
    ],
  }),

  lowerWorkout({
    week: 11,
    title: "Front Squat Expression + Deep Lateral Control",
    summary:
      "Complete the strongest training week with heavy upright squats and confident control through lateral range.",
    focus: ["Front squat", "Lateral range", "Adductor strength"],
    range: [
      move("Weighted Cossack squat", "6/side"),
      move("Loaded elevated pancake good morning", "7 reps"),
      move("Straddle compression lift", "8/side"),
    ],
    primaryTitle: "Primary strength — 4 sets",
    primary: [
      move("Front squat", "3 reps @ RPE 8–8.5"),
      "Rest 2–3 minutes; finish with one technically sound rep still available",
    ],
    accessory: [
      move("Lateral lunge", "6/side @ RPE 8"),
      move("Dumbbell Romanian deadlift", "7 reps with a 3-second descent"),
      "Rest 75–90 seconds between rounds",
    ],
    endRange: [
      move("Weighted Cossack squat", "5/side at the deepest controlled range"),
      move("Loaded pancake good morning", "6 slow reps"),
      move("Copenhagen plank long lever", "20–25 seconds/side"),
    ],
    scaling: [
      `${move("Double-dumbbell front squat", "4 × 4")} can replace front squats`,
      `Use a shorter lever for the ${move("Copenhagen plank", "if the pelvis rotates")}`,
      "Keep the pancake seat high enough to load the hips rather than the spine",
    ],
    record: [
      "Front-squat load and final-set RPE",
      "Lateral-lunge load and depth",
      "Lowest loaded pancake seat",
      "Copenhagen hold time",
    ],
  }),
  upperWorkout({
    week: 11,
    title: "Independent Balance + Combined Skill",
    summary:
      "Practice all three gymnastics goals at their strongest sustainable level before the final review week.",
    focus: ["Handstand", "Bar muscle-up", "Front lever"],
    handstand: [
      move("Freestanding handstand", "10 quality attempts"),
      move("Handstand shoulder tap progression", "3 × 4/side"),
      "Choose a wall-assisted tap if weight shifts are not yet controlled",
    ],
    primarySkillTitle: "Combined skill — 12 minutes",
    primarySkill: [
      move("Bar muscle-up", "4–6 clean singles with full rest"),
      move("Single-leg front lever hold", "4 × 5–8 seconds/shape"),
      "Alternate skills and keep every effort below failure",
    ],
    secondarySkillTitle: "Skill strength — 6 minutes",
    secondarySkill: [
      move("Straight bar dip", "3 × 6 reps"),
      move("Advanced tuck front lever row", "3 × 4 reps"),
    ],
    strength: [
      move("Weighted pull-up", "3 reps @ RPE 8–8.5"),
      move("Dumbbell bench press", "5 reps @ RPE 8"),
      "Rest 2 minutes between rounds",
    ],
    resilience: [
      move("Ring support turn out", "25 seconds"),
      move("Bottom-up kettlebell carry", "25 m/side"),
    ],
    range: [
      move("Skin the cat", "3 controlled reps"),
      move("Prone shoulder flexion lift", "8 reps"),
    ],
    scaling: [
      `${move("Wall handstand shoulder tap", "3 × 4/side")} can replace freestanding taps`,
      `Use ${move("Band-assisted bar muscle-up", "4–6 singles")} for clean transitions`,
      `${move("Advanced tuck front lever hold", "4 × 8 seconds")} can replace single-leg holds`,
    ],
    record: [
      "Best handstand hold and tap progression",
      "Clean or assisted muscle-up singles",
      "Front-lever progression and hold",
      "Weighted pull-up load",
    ],
  }),
  conditioningWorkout({
    week: 11,
    title: "Thirty-Minute Durable Engine",
    summary:
      "Complete the longest effort of the program with disciplined pacing and durable full-body movement.",
    focus: ["Long capacity", "Pacing", "Full-body durability"],
    capacityTitle: "Capacity — 30-minute AMRAP",
    capacity: [
      move("Row", "400 m"),
      move("Kettlebell swing", "15 reps"),
      move("Dumbbell box step-up", "8/side"),
      move("Push-up", "10 reps"),
      move("Farmer carry", "40 m"),
      "Start at RPE 6 and finish no higher than RPE 8",
    ],
    resilience: [
      move("Single-leg calf raise", "15/side"),
      move("Side plank row", "8/side"),
      move("Reverse bear crawl", "10 m"),
    ],
    range: [
      move("Deep squat breathing", "5 breaths"),
      move("Quadruped thoracic rotation", "6/side"),
    ],
    scaling: [
      `${move("Kettlebell deadlift", "15 reps")} can replace swings`,
      `${move("Incline push-up", "10 reps")} should remain unbroken`,
      "Reduce load or distance to preserve the planned steady pace",
    ],
    record: [
      "Rounds plus reps",
      "Loads used",
      "Average row pace",
      "Session RPE",
    ],
    durationMinutes: 60,
  }),

  lowerWorkout({
    week: 12,
    title: "Lower Benchmark + Range Review",
    summary:
      "Finish the block with a strong submaximal squat set and repeat the original lower-body range measures.",
    focus: ["Strength benchmark", "Pancake benchmark", "Review"],
    range: [
      move("Supported Cossack squat", "5/side at best controlled depth"),
      move(
        "Elevated straddle good morning",
        "6 reps at the lowest upright seat",
      ),
      move("Straddle leg lift", "maximum clean reps up to 10/side"),
    ],
    primaryTitle: "Strength benchmark — 3 working sets",
    primary: [
      move(
        "Back squat",
        "build to 5 reps @ RPE 8, then 2 × 5 at 10% less load",
      ),
      "This is a repeatable benchmark, not a five-rep maximum",
    ],
    accessory: [
      move("Rear-foot-elevated split squat", "5/side, two rounds only"),
      move("Single-leg Romanian deadlift", "6/side, two rounds only"),
      "Move smoothly and leave several reps available",
    ],
    endRange: [
      move("Supported pancake hold", "one relaxed 60-second benchmark"),
      move("Standing hamstring end-range isometric", "20 seconds/side"),
      move("Cossack squat isometric", "20 seconds/side"),
    ],
    scaling: [
      `${move("Goblet squat", "build to 8 reps @ RPE 8")} can be the benchmark`,
      "Use the same range setup as Week 1 before attempting a lower position",
      "Stop range tests before sharp, tingling, or nerve-like symptoms",
    ],
    record: [
      "Back-squat benchmark load and RPE",
      "Best controlled Cossack depth",
      "Lowest upright straddle seat elevation",
      "Change from Weeks 1 and 4",
    ],
    durationMinutes: 54,
  }),
  upperWorkout({
    week: 12,
    title: "Gymnastics Benchmark + Upper Review",
    summary:
      "Record clean outcomes for the handstand, bar muscle-up, and front lever without turning the final session into a max-out.",
    focus: ["Skill benchmark", "Upper strength", "Review"],
    handstand: [
      move("Freestanding handstand", "6–8 rested attempts"),
      move("Chest-to-wall handstand", "one 30-second line reset"),
      "Record the best technically controlled hold",
    ],
    primarySkillTitle: "Gymnastics benchmark — 15 minutes",
    primarySkill: [
      move(
        "Bar muscle-up",
        "up to 5 clean singles or best current assisted variation",
      ),
      move("Front lever hold", "4 attempts at the best controlled progression"),
      "Rest fully and stop before technique deteriorates",
    ],
    secondarySkillTitle: "Skill strength review — 5 minutes",
    secondarySkill: [
      move("Explosive chest-to-bar pull-up", "3 × 3 reps"),
      move(
        "Front lever row",
        "3 × 3–5 reps at the best controlled progression",
      ),
    ],
    strength: [
      move("Weighted chin-up", "build to 5 reps @ RPE 8, then 2 × 5 lighter"),
      move("Half-kneeling dumbbell press", "5/side for three comfortable sets"),
      "Rest 2 minutes between rounds",
    ],
    resilience: [
      move("Ring support hold", "20 seconds"),
      move("Ring face pull", "10 reps"),
    ],
    range: [
      move("German hang", "2 × 25 seconds"),
      move("Wall shoulder flexion lift-off", "6 reps"),
    ],
    scaling: [
      `Benchmark the ${move("Wall handstand toe pull", "instead of freestanding holds")} if appropriate`,
      `Use ${move("Band-assisted bar muscle-up", "for the benchmark and record the band")}`,
      "Benchmark the front-lever progression you can reproduce today",
    ],
    record: [
      "Best controlled handstand hold",
      "Clean muscle-ups or assistance used",
      "Best front-lever progression and hold",
      "Chin-up benchmark load and comparison with Week 1",
    ],
    durationMinutes: 58,
  }),
  conditioningWorkout({
    week: 12,
    title: "CAPABLE Baseline Retest",
    summary:
      "Repeat the opening conditioning session, compare pacing and output, and finish the program with movement quality intact.",
    focus: ["Benchmark", "Aerobic capacity", "Program review"],
    capacityTitle: "Capacity retest — 20-minute AMRAP",
    capacity: [
      move("Row", "250 m at a sustainable pace"),
      move("Kettlebell deadlift", "10 reps"),
      move("Push-up", "8 reps"),
      move("Goblet reverse lunge", "6/side"),
      "Use the same variations and loads as Week 1 when possible",
    ],
    resilience: [
      move("Suitcase carry", "30 m/side"),
      move("Tibialis raise", "15 reps"),
      move("Dead bug", "6/side with a full exhale"),
    ],
    range: [
      move("Cossack squat", "5/side"),
      move("Quadruped thoracic rotation", "6/side"),
    ],
    scaling: [
      "Use the exact Week 1 substitutions so the result remains comparable",
      "Match or improve pacing before chasing extra rounds",
      "Stop with movement quality intact; this is not an all-out test",
    ],
    record: [
      "Rounds plus reps completed",
      "Rower pace and loads",
      "Change from Week 1",
      "Program reflections and next priorities",
    ],
  }),
]

if (capableWorkouts.length !== 36) {
  throw new Error(
    `CAPABLE must contain 36 workouts, found ${capableWorkouts.length}`,
  )
}
