import { neon } from "@neondatabase/serverless"
import "dotenv/config"

import {
  hybridPplProgram,
  hybridPplWorkouts,
} from "../data/hybrid-ppl-program.mjs"
import {
  recommendedRoutineProgram,
  recommendedRoutineWorkouts,
} from "../data/recommended-routine-program.mjs"

const definitions = {
  "hybrid-ppl": [hybridPplProgram, hybridPplWorkouts],
  "recommended-routine": [
    recommendedRoutineProgram,
    recommendedRoutineWorkouts,
  ],
}

const slug = process.argv.slice(2).find((arg) => !arg.startsWith("--"))
if (!definitions[slug]) {
  throw new Error(
    `Usage: seed-ongoing-program.mjs <${Object.keys(definitions).join("|")}> [--dry-run]`,
  )
}
const [definition, workouts] = definitions[slug]

function publicationKey(workout) {
  return `${definition.slug}:${workout.key}`
}

function referenceDate(workout) {
  return `2000-01-${String(workout.position).padStart(2, "0")}`
}

const isDryRun = process.argv.includes("--dry-run")
const expectedKeys = workouts.map(publicationKey)
const expectedPromptCounts = workouts.map((workout) =>
  workout.content.reduce(
    (total, section) =>
      total +
      section.exercises.filter(
        (exercise) =>
          typeof exercise !== "string" && Boolean(exercise.recordPrompt),
      ).length,
    0,
  ),
)

if (isDryRun) {
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        program: definition.name,
        slug: definition.slug,
        workoutDefinitions: workouts.length,
        sequence: workouts.map((workout) => workout.title),
        recordPrompts: expectedPromptCounts.reduce(
          (total, count) => total + count,
          0,
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

await sql`
  alter table programs
    add column if not exists is_shared boolean not null default false,
    add column if not exists unrestricted_records_enabled boolean not null default false,
    add column if not exists archived_at timestamp with time zone
`
await sql`
  alter table program_workouts
    add column if not exists archived_at timestamp with time zone
`

const [existingProgram] = await sql`
  select id, created_by
  from programs
  where slug = ${definition.slug}
  limit 1
`

let ownerId = existingProgram?.created_by ?? process.env.PROGRAM_OWNER_ID
if (!ownerId) {
  const milePrograms = await sql`
    select created_by
    from programs
    where lower(name) = lower('MILE')
    order by id
  `
  if (milePrograms.length !== 1) {
    throw new Error(
      `Set PROGRAM_OWNER_ID or keep exactly one MILE program; found ${milePrograms.length}`,
    )
  }
  ownerId = milePrograms[0].created_by
}

const [recordsBefore] = existingProgram
  ? await sql`
      select count(*)::int as count
      from training_records
      join program_workouts
        on program_workouts.id = training_records.workout_id
      where program_workouts.program_id = ${existingProgram.id}
    `
  : [{ count: 0 }]

const [program] = await sql`
  insert into programs (
    name,
    slug,
    description,
    is_public,
    is_shared,
    unrestricted_records_enabled,
    start_date,
    duration_weeks,
    created_by,
    archived_at
  ) values (
    ${definition.name},
    ${definition.slug},
    ${definition.description},
    ${definition.isPublic},
    ${definition.isShared},
    ${definition.unrestrictedRecordsEnabled},
    null,
    null,
    ${ownerId},
    null
  )
  on conflict (slug) do update set
    name = excluded.name,
    description = excluded.description,
    is_public = excluded.is_public,
    is_shared = excluded.is_shared,
    unrestricted_records_enabled = excluded.unrestricted_records_enabled,
    start_date = excluded.start_date,
    duration_weeks = excluded.duration_weeks,
    archived_at = null,
    updated_at = current_timestamp
  returning id, name, slug, created_by
`

for (const workout of workouts) {
  const key = publicationKey(workout)
  const contentJson = JSON.stringify(workout.content)
  const focusJson = JSON.stringify(workout.focus)
  const equipmentJson = JSON.stringify(workout.equipment)

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
      phase_number,
      week_number,
      session_number,
      duration_minutes,
      focus,
      equipment,
      archived_at
    ) values (
      ${program.id},
      ${referenceDate(workout)},
      ${workout.title},
      ${workout.summary},
      ${contentJson}::jsonb,
      null,
      'published'::program_workout_status,
      null,
      ${key},
      null,
      null,
      ${workout.position},
      ${workout.durationMinutes},
      array(select jsonb_array_elements_text(${focusJson}::jsonb)),
      array(select jsonb_array_elements_text(${equipmentJson}::jsonb)),
      null
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
      phase_number = excluded.phase_number,
      week_number = excluded.week_number,
      session_number = excluded.session_number,
      duration_minutes = excluded.duration_minutes,
      focus = excluded.focus,
      equipment = excluded.equipment,
      archived_at = null,
      updated_at = current_timestamp
  `
}

const expectedKeysJson = JSON.stringify(expectedKeys)
const obsoleteWorkouts = await sql`
  select
    program_workouts.id,
    exists (
      select 1
      from training_records
      where training_records.workout_id = program_workouts.id
    ) as has_history
  from program_workouts
  where program_workouts.program_id = ${program.id}
    and program_workouts.publication_key like ${`${definition.slug}:%`}
    and not (
      program_workouts.publication_key = any(
        array(select jsonb_array_elements_text(${expectedKeysJson}::jsonb))
      )
    )
`

let archivedDefinitions = 0
let deletedDefinitions = 0
for (const workout of obsoleteWorkouts) {
  if (workout.has_history) {
    await sql`
      update program_workouts
      set archived_at = current_timestamp, updated_at = current_timestamp
      where id = ${workout.id}
    `
    archivedDefinitions += 1
  } else {
    await sql`delete from program_workouts where id = ${workout.id}`
    deletedDefinitions += 1
  }
}

const activeWorkouts = await sql`
  select id, title, session_number, content
  from program_workouts
  where program_id = ${program.id}
    and status = 'published'
    and archived_at is null
  order by date, id
`
const [verifiedProgram] = await sql`
  select is_public, is_shared, unrestricted_records_enabled, duration_weeks
  from programs
  where id = ${program.id}
`
const [recordsAfter] = await sql`
  select count(*)::int as count
  from training_records
  join program_workouts
    on program_workouts.id = training_records.workout_id
  where program_workouts.program_id = ${program.id}
`

const actualPromptCounts = activeWorkouts.map((workout) =>
  workout.content.reduce(
    (total, section) =>
      total +
      section.exercises.filter(
        (exercise) =>
          typeof exercise !== "string" && Boolean(exercise.recordPrompt),
      ).length,
    0,
  ),
)

if (
  activeWorkouts.length !== workouts.length ||
  JSON.stringify(actualPromptCounts) !== JSON.stringify(expectedPromptCounts) ||
  verifiedProgram.is_public !== definition.isPublic ||
  verifiedProgram.is_shared !== definition.isShared ||
  verifiedProgram.unrestricted_records_enabled !==
    definition.unrestrictedRecordsEnabled ||
  verifiedProgram.duration_weeks !== null ||
  recordsAfter.count !== recordsBefore.count
) {
  throw new Error(
    `${definition.name} verification failed: ${JSON.stringify({
      workoutCount: activeWorkouts.length,
      actualPromptCounts,
      expectedPromptCounts,
      verifiedProgram,
      recordsBefore: recordsBefore.count,
      recordsAfter: recordsAfter.count,
    })}`,
  )
}

console.log(
  JSON.stringify(
    {
      program,
      workoutDefinitions: activeWorkouts.length,
      sequence: activeWorkouts.map((workout) => workout.title),
      recordPrompts: actualPromptCounts.reduce(
        (total, count) => total + count,
        0,
      ),
      existingSessionRecords: recordsAfter.count,
      archivedDefinitions,
      deletedDefinitions,
    },
    null,
    2,
  ),
)
