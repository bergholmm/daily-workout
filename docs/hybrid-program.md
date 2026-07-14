# Strength · Skill · Engine · Range

This file is the source of truth for the public daily training feed.

## Publishing schedule

- Program start: 2026-07-13 (Week 1)
- Duration: 12 weeks
- Training days: Monday, Tuesday, Thursday, Friday
- Generation job: every evening at 20:00 Europe/Stockholm
- Reveal time: 05:00 Europe/Stockholm on the workout date
- Program slug: `strength-skill-engine-range`
- Publication key: `strength-skill-engine-range:YYYY-MM-DD`

The generation job is idempotent. It must check the publication key before it
creates anything. Existing workouts are not replaced unless a correction is
explicitly required.

## Program identity

The program is a skill-biased hybrid plan built around four qualities:

1. Strength — heavy squats, hinges, presses, weighted calisthenics, and carries.
2. Skill — handstand, bar muscle-up, front lever, and foundational ring work.
3. Engine — one short intensive and one longer sustainable conditioning session.
4. Range — pancake development, active flexibility, and end-range strength.

MILE is an exercise library, not the identity of the program. Its preparation,
unilateral strength, locomotion, loaded mobility, and decompression exercises
can be selected when they support the session objective.

## Weekly structure

### Monday — Handstand, squat, pancake

- Handstand line and balance practice
- One primary squat lift
- One unilateral lower-body pairing
- Active pancake work and a relaxed hold
- Target duration: 55–60 minutes

### Tuesday — Bar muscle-up, upper strength, short intensity

- Kip mechanics and a current bar muscle-up progression
- Vertical pull and dip strength
- A small, low-fatigue front-lever supporting exposure
- A 6–10 minute intensive conditioning piece that does not compromise pulling
  technique
- Target duration: 50–60 minutes

### Thursday — Front lever, hinge, press

- Front-lever isometrics and/or rows while fresh
- One primary hinge lift
- One press
- Carries or trunk assistance
- No hard conditioning
- Target duration: 50–60 minutes

### Friday — Hybrid capacity, movement, pancake

- Brief handstand or muscle-up technique review
- Sustainable 20–25 minute mixed conditioning
- Carries, crawls, kettlebells, and bodyweight movements
- Focused pancake/end-range work
- Target duration: 45–55 minutes

## Twelve-week progression

- Weeks 1–4: Foundation. Learn positions, establish loads, and build aerobic
  control. Week 4 reduces volume.
- Weeks 5–8: Build. Increase load, use harder skill progressions, and increase
  conditioning density. Week 8 reduces volume.
- Weeks 9–12: Express. Use heavier lower-volume strength work, controlled skill
  attempts, and repeated benchmarks. Week 12 reduces volume and reviews the
  block.

Progress only one meaningful variable at a time: load, reps, hold duration,
range, or movement difficulty. Inspect recent published workouts before writing
the next one so progression stays coherent.

## Session rules

- Give each day no more than two primary objectives.
- Put gymnastics skill before heavy strength or conditioning.
- Use one major barbell lift per session.
- Keep most strength work around RPE 7–8 and avoid routine failure.
- Provide a clear regression for gymnastics movements.
- Do not place high-skill gymnastics inside a fatiguing metcon.
- Tuesday is the only short high-intensity session.
- Friday conditioning must be sustainable; the final round should resemble the
  first.
- Pancake work combines passive range, active compression, and controlled loaded
  range. Never prescribe forcing through sharp pain, tingling, or nerve-like
  symptoms.
- Always finish with a `Scaling` section and a `Record` section.

## Movement demos

- Treat demonstration coverage as part of writing the workout. Link every
  prescribed exercise, movement, progression, and movement-based scaling option
  to a YouTube search for its exact name, including familiar movements and each
  alternative listed on the same line.
- Put links directly in the exercise string with Markdown syntax, for example:
  `[Chest-to-wall handstand](https://www.youtube.com/results?search_query=Chest-to-wall%20handstand) — 5 × 20 seconds`.
- Build the URL from `https://www.youtube.com/results?search_query=` plus the
  URL-encoded movement name. Do not select or endorse a single video.
- Do not add embedded videos, direct video links, MILE/Mux streams, or section
  `videoUrl` values. Set the workout-level `videoUrl` to `null`.
- Leave rest periods, coaching cues, safety notes, and items in the `Record`
  section as plain text; these are instructions or prompts rather than
  movements.

## Supporting sections

- `Scaling` and `Record` are supporting information, not numbered workout
  blocks. Keep them last in the payload so the public feed can render them after
  the training sequence.
- `Scaling` should contain concise movement substitutions, loading guidance, or
  range-of-motion adjustments.
- `Record` should contain only the small set of useful results to log after the
  session.

## Workout payload

The generated JSON is passed to `pnpm workout:publish` on standard input:

```json
{
  "date": "2026-07-16",
  "title": "Front Lever Foundations",
  "summary": "Build straight-arm pulling control before a focused hinge session.",
  "status": "scheduled",
  "publishAt": "2026-07-16T05:00:00+02:00",
  "weekNumber": 1,
  "sessionNumber": 3,
  "durationMinutes": 55,
  "focus": ["Front lever", "Hinge strength"],
  "equipment": ["Pull-up bar", "Barbell", "Kettlebell"],
  "content": [
    {
      "title": "Preparation — 2 rounds",
      "exercises": ["Active hang — 20 seconds"]
    }
  ]
}
```

Use concise exercise lines with sets, reps or time, rest when relevant, and one
useful technique cue. The publisher validates the payload and performs an
idempotent database upsert.
