import { neon } from "@neondatabase/serverless"
import "dotenv/config"
import { z } from "zod"

const PROGRAM_SLUG = "strength-skill-engine-range"

const sectionSchema = z.object({
  title: z.string().min(1),
  exercises: z.array(z.string().min(1)).min(1),
  videoUrl: z.url().nullable().optional(),
})

const workoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(255),
  summary: z.string().min(1),
  status: z.enum(["scheduled", "published"]).default("scheduled"),
  publishAt: z.iso.datetime({ offset: true }),
  weekNumber: z.number().int().min(1).max(12),
  sessionNumber: z.number().int().min(1).max(4),
  durationMinutes: z.number().int().min(20).max(90),
  focus: z.array(z.string().min(1)).min(1),
  equipment: z.array(z.string().min(1)),
  content: z.array(sectionSchema).min(3),
  videoUrl: z.url().nullable().optional(),
})

async function readStdin() {
  let input = ""
  for await (const chunk of process.stdin) input += chunk
  return input
}

const raw = await readStdin()
if (!raw.trim()) {
  throw new Error("Pass a workout JSON payload on standard input")
}

const parsed = workoutSchema.safeParse(JSON.parse(raw))
if (!parsed.success) {
  console.error(z.prettifyError(parsed.error))
  process.exit(1)
}

const workout = parsed.data
const publicationKey = `${PROGRAM_SLUG}:${workout.date}`

if (process.argv.includes("--dry-run")) {
  console.log(
    JSON.stringify(
      {
        valid: true,
        publicationKey,
        title: workout.title,
        sections: workout.content.length,
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
const programs = await sql`
  select id
  from programs
  where slug = ${PROGRAM_SLUG} and is_public = true
  limit 1
`

if (!programs[0]) {
  throw new Error(`Public program ${PROGRAM_SLUG} does not exist`)
}

const focusJson = JSON.stringify(workout.focus)
const equipmentJson = JSON.stringify(workout.equipment)
const contentJson = JSON.stringify(workout.content)

const rows = await sql`
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
    ${programs[0].id},
    ${workout.date},
    ${workout.title},
    ${workout.summary},
    ${contentJson}::jsonb,
    ${workout.videoUrl ?? null},
    ${workout.status}::program_workout_status,
    ${workout.publishAt}::timestamptz,
    ${publicationKey},
    ${workout.weekNumber},
    ${workout.sessionNumber},
    ${workout.durationMinutes},
    array(select jsonb_array_elements_text(${focusJson}::jsonb)),
    array(select jsonb_array_elements_text(${equipmentJson}::jsonb))
  )
  on conflict (publication_key) do update set
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
  returning id, date, title, status, publish_at
`

console.log(JSON.stringify(rows[0], null, 2))
