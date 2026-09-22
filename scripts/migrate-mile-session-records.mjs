import { neon } from "@neondatabase/serverless"
import "dotenv/config"
import { randomUUID } from "node:crypto"

import {
  getMileWorkoutPosition,
  mileWorkoutOrder,
} from "../data/mile-program-order.mjs"

const isDryRun = process.argv.includes("--dry-run")

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)

const matchingPrograms = await sql`
  select id, name, created_by
  from programs
  where lower(name) = lower('MILE')
  order by id
`

if (matchingPrograms.length !== 1) {
  throw new Error(
    `Expected exactly one MILE program; found ${matchingPrograms.length}`,
  )
}

const program = matchingPrograms[0]
const workouts = await sql`
  select id, title, content, phase_number, session_number
  from program_workouts
  where program_id = ${program.id}
  order by date, id
`

if (workouts.length !== 9) {
  throw new Error(`Expected 9 MILE workouts; found ${workouts.length}`)
}

const positionedWorkouts = workouts.map((workout) => {
  const position = getMileWorkoutPosition(workout.title)
  if (!position) {
    throw new Error(`Unexpected MILE workout title: ${workout.title}`)
  }
  return { ...workout, ...position }
})

if (
  new Set(
    positionedWorkouts.map(
      (workout) => `${workout.phaseNumber}:${workout.emphasisNumber}`,
    ),
  ).size !== 9
) {
  throw new Error("MILE workouts must occupy nine unique order positions")
}

function migrateContent(workout) {
  let promptCount = 0
  let changed = false
  const content = workout.content.map((section) => {
    if (!Array.isArray(section.exercises)) return section

    return {
      ...section,
      exercises: section.exercises.map((exercise) => {
        promptCount += 1
        if (typeof exercise !== "string") {
          if (exercise.recordPrompt) return exercise
          changed = true
          return {
            ...exercise,
            recordPrompt: exercise.recordPrompt ?? { label: exercise.name },
          }
        }

        changed = true
        return {
          id: randomUUID(),
          name: exercise,
          recordPrompt: { label: exercise },
        }
      }),
    }
  })

  return { content, promptCount, changed }
}

const migratedWorkouts = positionedWorkouts.map((workout) => ({
  ...workout,
  ...migrateContent(workout),
}))
const promptCount = migratedWorkouts.reduce(
  (total, workout) => total + workout.promptCount,
  0,
)
const changedWorkouts = migratedWorkouts.filter(
  (workout) => workout.changed,
).length
const reorderedWorkouts = migratedWorkouts.filter(
  (workout) =>
    workout.phase_number !== workout.phaseNumber ||
    workout.session_number !== workout.emphasisNumber,
).length

const [recordCountBefore] = await sql`
  select count(*)::int as count
  from training_records
  join program_workouts
    on program_workouts.id = training_records.workout_id
  where program_workouts.program_id = ${program.id}
`

if (isDryRun) {
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        program,
        workoutDefinitions: workouts.length,
        recordPrompts: promptCount,
        workoutDefinitionsToUpdate: changedWorkouts,
        workoutDefinitionsToReorder: reorderedWorkouts,
        existingSessionRecords: recordCountBefore.count,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

await sql`
  alter table programs
    add column if not exists is_shared boolean not null default false,
    add column if not exists unrestricted_records_enabled boolean not null default false,
    add column if not exists archived_at timestamp with time zone
`
await sql`
  alter table program_workouts
    add column if not exists archived_at timestamp with time zone,
    add column if not exists phase_number integer,
    add column if not exists session_number integer
`
await sql`
  alter table training_records
    add column if not exists performed_on date,
    add column if not exists note text,
    alter column program_run_id drop not null,
    alter column week_number drop not null
`
await sql`
  do $$
  declare
    constraint_to_replace text;
  begin
    for constraint_to_replace in
      select distinct constraints.conname
      from pg_constraint constraints
      join pg_attribute columns
        on columns.attrelid = constraints.conrelid
        and columns.attnum = any(constraints.conkey)
      where constraints.conrelid = 'training_records'::regclass
        and constraints.contype = 'f'
        and columns.attname in ('program_run_id', 'workout_id')
        and constraints.confdeltype <> 'r'
    loop
      execute format(
        'alter table training_records drop constraint %I',
        constraint_to_replace
      );
    end loop;

    if not exists (
      select 1
      from pg_constraint constraints
      join pg_attribute columns
        on columns.attrelid = constraints.conrelid
        and columns.attnum = any(constraints.conkey)
      where constraints.conrelid = 'training_records'::regclass
        and constraints.contype = 'f'
        and columns.attname = 'program_run_id'
    ) then
      alter table training_records
        add constraint training_records_program_run_id_fkey
        foreign key (program_run_id)
        references program_runs(id)
        on delete restrict;
    end if;

    if not exists (
      select 1
      from pg_constraint constraints
      join pg_attribute columns
        on columns.attrelid = constraints.conrelid
        and columns.attnum = any(constraints.conkey)
      where constraints.conrelid = 'training_records'::regclass
        and constraints.contype = 'f'
        and columns.attname = 'workout_id'
    ) then
      alter table training_records
        add constraint training_records_workout_id_fkey
        foreign key (workout_id)
        references program_workouts(id)
        on delete restrict;
    end if;
  end
  $$
`
await sql`
  update training_records
  set performed_on = created_at::date
  where performed_on is null
`
await sql`
  alter table training_records
    alter column performed_on set default current_date,
    alter column performed_on set not null
`
await sql`
  do $$
  begin
    if not exists (
      select 1
      from pg_constraint
      where conname = 'training_records_occurrence_pair_check'
        and conrelid = 'training_records'::regclass
    ) then
      alter table training_records
        add constraint training_records_occurrence_pair_check
        check (
          (program_run_id is null and week_number is null)
          or (program_run_id is not null and week_number is not null)
        );
    end if;
  end
  $$
`
await sql`
  create index if not exists training_records_user_workout_performed_idx
  on training_records (user_id, workout_id, performed_on)
`

for (const workout of migratedWorkouts) {
  await sql`
    update program_workouts
    set
      content = ${JSON.stringify(workout.content)}::jsonb,
      phase_number = ${workout.phaseNumber},
      session_number = ${workout.emphasisNumber},
      updated_at = current_timestamp
    where id = ${workout.id}
      and program_id = ${program.id}
  `
}

await sql`
  update programs
  set
    is_shared = true,
    unrestricted_records_enabled = true,
    updated_at = current_timestamp
  where id = ${program.id}
`

const [verification] = await sql`
  select
    programs.is_shared,
    programs.unrestricted_records_enabled,
    count(distinct program_workouts.id)::int as workout_count,
    count(training_records.id)::int as record_count
  from programs
  join program_workouts on program_workouts.program_id = programs.id
  left join training_records
    on training_records.workout_id = program_workouts.id
  where programs.id = ${program.id}
  group by programs.id
`
const verifiedWorkouts = await sql`
  select id, title, phase_number, session_number, content
  from program_workouts
  where program_id = ${program.id}
  order by phase_number, session_number, id
`
const verifiedPromptCount = verifiedWorkouts.reduce(
  (total, workout) => total + migrateContent(workout).promptCount,
  0,
)
const hasLegacyExercise = verifiedWorkouts.some((workout) =>
  workout.content.some(
    (section) =>
      Array.isArray(section.exercises) &&
      section.exercises.some(
        (exercise) =>
          typeof exercise === "string" ||
          !exercise.id ||
          !exercise.recordPrompt?.label,
      ),
  ),
)
const verifiedOrder = verifiedWorkouts.map((workout) => ({
  phaseNumber: workout.phase_number,
  emphasisNumber: workout.session_number,
  title: workout.title,
}))

if (
  !verification.is_shared ||
  !verification.unrestricted_records_enabled ||
  verification.workout_count !== 9 ||
  verification.record_count !== recordCountBefore.count ||
  verifiedPromptCount !== promptCount ||
  hasLegacyExercise ||
  JSON.stringify(verifiedOrder) !== JSON.stringify(mileWorkoutOrder)
) {
  throw new Error(
    `MILE verification failed: ${JSON.stringify({
      verification,
      expectedRecordCount: recordCountBefore.count,
      promptCount,
      verifiedPromptCount,
      hasLegacyExercise,
      verifiedOrder,
    })}`,
  )
}

console.log(
  JSON.stringify(
    {
      migrated: true,
      program: { id: program.id, name: program.name },
      workoutDefinitions: verification.workout_count,
      recordPrompts: verifiedPromptCount,
      preservedSessionRecords: verification.record_count,
      workoutOrder: verifiedOrder.map((workout) => workout.title),
    },
    null,
    2,
  ),
)
