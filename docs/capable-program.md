# CAPABLE

CAPABLE is a self-paced 12-week program for strength, flexibility, and
longevity. The full program is written and reviewed as one coherent block; it
is not generated one day at a time.

## Source of truth

- Program content: `data/capable-program.mjs`
- Database synchronization: `scripts/seed-capable-program.mjs`
- Public route: `/training`
- Program slug: `capable`
- Workout keys: `capable:wWW:sN`

Run `pnpm program:seed --dry-run` to validate the program without touching the
database. Run `pnpm program:seed` to synchronize the complete program to the
configured database.

The synchronization is idempotent. Existing CAPABLE workouts are updated by
their week/session key so their IDs and user records survive future content
revisions. Sessions removed from the source are removed from the database.

## Weekly rhythm

CAPABLE contains 36 sessions: three sessions per week for twelve weeks.

1. Lower — suggested Monday
2. Upper — suggested Wednesday
3. Conditioning — suggested Friday

The schedule is a recommended recovery rhythm, not a calendar lock. Every
session is immediately available and the athlete progresses at their own pace.

## Phases

### Phase 1 — Range & Control (Weeks 1–4)

Establish strong positions, reliable technique, and baseline mobility. Week 4
reduces volume and records clean, submaximal benchmarks.

### Phase 2 — Strength Through Range (Weeks 5–8)

Add load and harder skill progressions while maintaining control. Week 8
consolidates the work without taking a full week off.

### Phase 3 — Capacity & Expression (Weeks 9–12)

Express the developed strength and range under heavier load, more complete
skills, and sustainable fatigue. Week 12 repeats useful benchmarks.

## Session intent

### Lower

- Dynamic preparation
- Active range preparation
- One primary squat or hinge
- Unilateral and posterior-chain strength
- End-range hip, hamstring, and adductor strength
- Five minutes of relaxed decompression

### Upper

- Wrist, scapular, and trunk preparation
- Handstand exposure every week
- Bar muscle-up and front-lever work every week, with alternating emphasis
- Balanced push and pull strength
- Shoulder resilience and active range
- Five minutes of relaxed decompression

### Conditioning

- Locomotion and full-body preparation
- Mostly sustainable mixed-modal conditioning
- Occasional short, repeatable high-intensity intervals
- Carries, trunk work, lower-leg resilience, and full-body range
- Five minutes of relaxed decompression

## Programming rules

- Keep normal sessions near 50–60 minutes.
- Keep most strength work around RPE 7–8 and avoid routine failure.
- Progress one meaningful variable at a time: load, reps, hold duration, range,
  or movement difficulty.
- Keep high-skill gymnastics ahead of fatigue and outside conditioning pieces.
- Maintain three training days during Weeks 4, 8, and 12 while reducing total
  volume by roughly 20–30 percent.
- Treat flexibility as both active end-range strength and relaxed
  decompression—not as an afterthought.
- Never force sharp pain, tingling, or nerve-like symptoms.

## Movement demonstrations and records

Every prescribed movement and movement-based alternative links to a YouTube
search for its exact name. CAPABLE does not embed videos or use MILE videos.

`Scaling` and `Record` are supporting panels rather than numbered workout
blocks. Record prompts are stored privately per signed-in user.
