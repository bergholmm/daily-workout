import { neon } from "@neondatabase/serverless"
import "dotenv/config"
import { z } from "zod"

import { capableProgram, capableWorkouts } from "../data/capable-program.mjs"

const LEGACY_PROGRAM_SLUG = "strength-skill-engine-range"
const REFERENCE_START_DATE = "2026-01-05"

const workoutSchema = z.object({
  weekNumber: z.number().int().min(1).max(12),
  sessionNumber: z.number().int().min(1).max(3),
  dayType: z.enum(["Lower", "Upper", "Conditioning"]),
  title: z.string().min(1).max(255),
  summary: z.string().min(1),
  durationMinutes: z.number().int().min(20).max(90),
  focus: z.array(z.string().min(1)).min(1),
  equipment: z.array(z.string().min(1)),
  content: z
    .array(
      z.object({
        title: z.string().min(1),
        exercises: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(3),
})

function referenceDate(weekNumber, sessionNumber) {
  const date = new Date(`${REFERENCE_START_DATE}T12:00:00Z`)
  const dayOffset = [0, 2, 4][sessionNumber - 1]
  date.setUTCDate(date.getUTCDate() + (weekNumber - 1) * 7 + dayOffset)
  return date.toISOString().slice(0, 10)
}

function publicationKey(workout) {
  return `${capableProgram.slug}:w${String(workout.weekNumber).padStart(2, "0")}:s${workout.sessionNumber}`
}

const parsed = z.array(workoutSchema).length(36).safeParse(capableWorkouts)
if (!parsed.success) {
  console.error(z.prettifyError(parsed.error))
  process.exit(1)
}

const uniqueSlots = new Set(
  capableWorkouts.map(
    (workout) => `${workout.weekNumber}:${workout.sessionNumber}`,
  ),
)
if (uniqueSlots.size !== 36) {
  throw new Error(
    "CAPABLE must contain one Lower, Upper, and Conditioning session per week",
  )
}

if (process.argv.includes("--dry-run")) {
  console.log(
    JSON.stringify(
      {
        valid: true,
        program: capableProgram.name,
        phases: capableProgram.phases.length,
        workouts: capableWorkouts.length,
        weeks: Math.max(
          ...capableWorkouts.map((workout) => workout.weekNumber),
        ),
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)

const [program] = await sql`
  insert into programs (
    name,
    slug,
    description,
    is_public,
    start_date,
    duration_weeks,
    created_by
  ) values (
    ${capableProgram.name},
    ${capableProgram.slug},
    ${capableProgram.description},
    true,
    null,
    ${capableProgram.durationWeeks},
    'capable-seed'
  )
  on conflict (slug) do update set
    name = excluded.name,
    description = excluded.description,
    is_public = excluded.is_public,
    start_date = excluded.start_date,
    duration_weeks = excluded.duration_weeks,
    updated_at = current_timestamp
  returning id, name, slug
`

for (const workout of capableWorkouts) {
  const contentJson = JSON.stringify(workout.content)
  const focusJson = JSON.stringify(workout.focus)
  const equipmentJson = JSON.stringify(workout.equipment)
  const key = publicationKey(workout)
  const date = referenceDate(workout.weekNumber, workout.sessionNumber)

  await sql`
    insert into program_workouts (
      program_id,
      date,
      title,
      summary,
      content,
      video_url,
      status,
      publish_at,
      publication_key,
      week_number,
      session_number,
      duration_minutes,
      focus,
      equipment
    ) values (
      ${program.id},
      ${date},
      ${workout.title},
      ${workout.summary},
      ${contentJson}::jsonb,
      null,
      'published'::program_workout_status,
      null,
      ${key},
      ${workout.weekNumber},
      ${workout.sessionNumber},
      ${workout.durationMinutes},
      array(select jsonb_array_elements_text(${focusJson}::jsonb)),
      array(select jsonb_array_elements_text(${equipmentJson}::jsonb))
    )
    on conflict (publication_key) do update set
      program_id = excluded.program_id,
      date = excluded.date,
      title = excluded.title,
      summary = excluded.summary,
      content = excluded.content,
      video_url = excluded.video_url,
      status = excluded.status,
      publish_at = excluded.publish_at,
      week_number = excluded.week_number,
      session_number = excluded.session_number,
      duration_minutes = excluded.duration_minutes,
      focus = excluded.focus,
      equipment = excluded.equipment,
      updated_at = current_timestamp
  `
}

const expectedKeysJson = JSON.stringify(capableWorkouts.map(publicationKey))
await sql`
  delete from program_workouts
  where program_id = ${program.id}
    and publication_key like 'capable:%'
    and not (
      publication_key = any(
        array(select jsonb_array_elements_text(${expectedKeysJson}::jsonb))
      )
    )
`

const [verification] = await sql`
  select
    count(*)::int as workout_count,
    count(distinct week_number)::int as week_count,
    min(session_number)::int as first_session,
    max(session_number)::int as last_session
  from program_workouts
  where program_id = ${program.id}
    and status = 'published'
`

if (
  verification.workout_count !== 36 ||
  verification.week_count !== 12 ||
  verification.first_session !== 1 ||
  verification.last_session !== 3
) {
  throw new Error(
    `CAPABLE verification failed: ${JSON.stringify(verification)}`,
  )
}

const removedLegacyPrograms = await sql`
  delete from programs
  where slug = ${LEGACY_PROGRAM_SLUG}
  returning id
`

console.log(
  JSON.stringify(
    {
      program,
      ...verification,
      removedLegacyPrograms: removedLegacyPrograms.length,
    },
    null,
    2,
  ),
)
