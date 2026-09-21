import { neon } from "@neondatabase/serverless"
import "dotenv/config"
import { z } from "zod"

import {
  builtToMoveDefinitions,
  builtToMoveProgram,
} from "../data/built-to-move-program.mjs"

const LEGACY_PROGRAM_SLUGS = ["capable", "strength-skill-engine-range"]
const REFERENCE_START_DATE = "2026-01-05"

const fourPrescriptions = z.array(z.string().trim().min(1)).length(4)

const movementSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(255),
  prescriptions: fourPrescriptions,
  notes: z.array(z.string().trim().min(1)).optional(),
  scaling: z.array(z.string().trim().min(1)).optional(),
})

const trainingSectionSchema = z.object({
  id: z.string().trim().min(1).max(100),
  kind: z.enum([
    "preparation",
    "skill",
    "main",
    "conditioning",
    "flexibility",
    "decompression",
  ]),
  title: z.string().trim().min(1),
  prescriptions: fourPrescriptions.optional(),
  movements: z.array(movementSchema).min(1),
  notes: z.array(z.string().trim().min(1)).optional(),
})

const recordSectionSchema = z.object({
  id: z.string().trim().min(1).max(100),
  kind: z.literal("record"),
  title: z.string().trim().min(1),
  fields: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(100),
        label: z.string().trim().min(1).max(255),
        placeholder: z.string().trim().min(1).max(255).optional(),
      }),
    )
    .min(1)
    .max(20),
})

const definitionSchema = z.object({
  levelNumber: z.number().int().min(1).max(3),
  emphasisNumber: z.number().int().min(1).max(3),
  emphasis: z.enum(["Lower", "Upper", "Conditioning"]),
  title: z.string().min(1).max(255),
  summary: z.string().min(1),
  durationMinutes: z.number().int().min(50).max(60),
  focus: z.array(z.string().min(1)).min(1),
  movementPatterns: z.array(z.string().min(1)).min(1),
  equipment: z.array(z.string().min(1)),
  content: z
    .array(z.union([trainingSectionSchema, recordSectionSchema]))
    .min(3),
})

function referenceDate(levelNumber, emphasisNumber) {
  const date = new Date(`${REFERENCE_START_DATE}T12:00:00Z`)
  const dayOffset = [0, 2, 4][emphasisNumber - 1]
  date.setUTCDate(date.getUTCDate() + (levelNumber - 1) * 28 + dayOffset)
  return date.toISOString().slice(0, 10)
}

function publicationKey(workout) {
  return `${builtToMoveProgram.slug}:l${String(workout.levelNumber).padStart(2, "0")}:e${workout.emphasisNumber}`
}

const parsedDefinitions = z
  .array(definitionSchema)
  .length(9)
  .safeParse(builtToMoveDefinitions)
if (!parsedDefinitions.success) {
  console.error(z.prettifyError(parsedDefinitions.error))
  process.exit(1)
}

const uniqueSlots = new Set(
  builtToMoveDefinitions.map(
    (workout) => `${workout.levelNumber}:${workout.emphasisNumber}`,
  ),
)
if (uniqueSlots.size !== 9) {
  throw new Error(
    "Built to Move must contain one Lower, Upper, and Conditioning workout per level",
  )
}

if (process.argv.includes("--dry-run")) {
  console.log(
    JSON.stringify(
      {
        valid: true,
        program: builtToMoveProgram.name,
        levels: builtToMoveProgram.levels.length,
        workoutDefinitions: builtToMoveDefinitions.length,
        recordableSessions: builtToMoveProgram.durationWeeks * 3,
        weeks: builtToMoveProgram.durationWeeks,
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

async function ensureProgramRunSchema() {
  await sql`
    do $$
    begin
      create type program_run_status as enum ('active', 'completed', 'abandoned');
    exception
      when duplicate_object then null;
    end
    $$
  `

  await sql`
    alter table program_workouts
      add column if not exists phase_number integer,
      add column if not exists archived_at timestamp with time zone
  `

  await sql`
    alter table programs
      add column if not exists is_shared boolean not null default false,
      add column if not exists unrestricted_records_enabled boolean not null default false,
      add column if not exists archived_at timestamp with time zone
  `

  await sql`
    create table if not exists program_runs (
      id serial primary key,
      program_id integer not null references programs(id) on delete cascade,
      user_id varchar(255) not null,
      status program_run_status not null default 'active',
      started_at timestamp with time zone not null default current_timestamp,
      ended_at timestamp with time zone,
      created_at timestamp with time zone not null default current_timestamp,
      updated_at timestamp with time zone not null default current_timestamp
    )
  `

  await sql`
    alter table training_records
      add column if not exists program_run_id integer,
      add column if not exists week_number integer
  `

  const [sessionSchema] = await sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'training_records'
        and column_name = 'performed_on'
    ) as supports_unrestricted_sessions
  `

  await sql`
    update program_workouts
    set phase_number = ceil(week_number::numeric / 4)::integer
    where phase_number is null
      and week_number is not null
  `

  if (!sessionSchema.supports_unrestricted_sessions) {
    await sql`
      insert into program_runs (program_id, user_id)
      select distinct program_workouts.program_id, training_records.user_id
      from training_records
      join program_workouts
        on program_workouts.id = training_records.workout_id
      where training_records.program_run_id is null
        and not exists (
          select 1
          from program_runs
          where program_runs.program_id = program_workouts.program_id
            and program_runs.user_id = training_records.user_id
            and program_runs.status = 'active'
        )
    `

    await sql`
      update training_records
      set
        program_run_id = (
          select program_runs.id
          from program_workouts
          join program_runs
            on program_runs.program_id = program_workouts.program_id
            and program_runs.user_id = training_records.user_id
          where program_workouts.id = training_records.workout_id
          order by program_runs.started_at desc, program_runs.id desc
          limit 1
        ),
        week_number = coalesce(
          training_records.week_number,
          (
            select program_workouts.week_number
            from program_workouts
            where program_workouts.id = training_records.workout_id
          ),
          1
        )
      where program_run_id is null or week_number is null
    `

    const [unmigrated] = await sql`
      select count(*)::int as count
      from training_records
      where program_run_id is null or week_number is null
    `
    if (unmigrated.count > 0) {
      throw new Error(
        `Could not preserve ${unmigrated.count} existing session records`,
      )
    }
  }

  await sql`
    alter table training_records
      add column if not exists performed_on date,
      add column if not exists note text,
      alter column program_run_id drop not null,
      alter column week_number drop not null
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
        where conrelid = 'training_records'::regclass
          and confrelid = 'program_runs'::regclass
          and contype = 'f'
      ) then
        alter table training_records
          add constraint training_records_program_run_id_fkey
          foreign key (program_run_id)
          references program_runs(id)
          on delete restrict;
      end if;
    end
    $$
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
    drop index if exists training_records_user_workout_idx
  `
  await sql`
    create unique index if not exists program_runs_active_user_program_idx
    on program_runs (user_id, program_id)
    where status = 'active'
  `
  await sql`
    create index if not exists program_runs_user_program_started_idx
    on program_runs (user_id, program_id, started_at)
  `
  await sql`
    create unique index if not exists training_records_run_workout_week_idx
    on training_records (program_run_id, workout_id, week_number)
  `
  await sql`
    create index if not exists training_records_user_workout_performed_idx
    on training_records (user_id, workout_id, performed_on)
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
}

await ensureProgramRunSchema()

const [program] = await sql`
  insert into programs (
    name,
    slug,
    description,
    is_public,
    unrestricted_records_enabled,
    start_date,
    duration_weeks,
    created_by
  ) values (
    ${builtToMoveProgram.name},
    ${builtToMoveProgram.slug},
    ${builtToMoveProgram.description},
    true,
    false,
    null,
    ${builtToMoveProgram.durationWeeks},
    'built-to-move-seed'
  )
  on conflict (slug) do update set
    name = excluded.name,
    description = excluded.description,
    is_public = excluded.is_public,
    unrestricted_records_enabled = excluded.unrestricted_records_enabled,
    start_date = excluded.start_date,
    duration_weeks = excluded.duration_weeks,
    updated_at = current_timestamp
  returning id, name, slug
`

for (const workout of builtToMoveDefinitions) {
  const contentJson = JSON.stringify(workout.content)
  const focusJson = JSON.stringify(workout.focus)
  const equipmentJson = JSON.stringify(workout.equipment)
  const key = publicationKey(workout)
  const date = referenceDate(workout.levelNumber, workout.emphasisNumber)

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
      ${workout.levelNumber},
      null,
      ${workout.emphasisNumber},
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
      phase_number = excluded.phase_number,
      week_number = excluded.week_number,
      session_number = excluded.session_number,
      duration_minutes = excluded.duration_minutes,
      focus = excluded.focus,
      equipment = excluded.equipment,
      updated_at = current_timestamp
  `
}

const expectedKeysJson = JSON.stringify(
  builtToMoveDefinitions.map(publicationKey),
)
await sql`
  delete from program_workouts
  where program_id = ${program.id}
    and publication_key like 'built-to-move:%'
    and not (
      publication_key = any(
        array(select jsonb_array_elements_text(${expectedKeysJson}::jsonb))
      )
    )
`

const [verification] = await sql`
  select
    count(*)::int as workout_count,
    count(distinct phase_number)::int as level_count,
    min(session_number)::int as first_emphasis,
    max(session_number)::int as last_emphasis
  from program_workouts
  where program_id = ${program.id}
    and status = 'published'
`

if (
  verification.workout_count !== 9 ||
  verification.level_count !== 3 ||
  verification.first_emphasis !== 1 ||
  verification.last_emphasis !== 3
) {
  throw new Error(
    `Built to Move verification failed: ${JSON.stringify(verification)}`,
  )
}

const hiddenLegacyPrograms = await sql`
  update programs legacy
  set is_public = false, updated_at = current_timestamp
  where legacy.slug in (${LEGACY_PROGRAM_SLUGS[0]}, ${LEGACY_PROGRAM_SLUGS[1]})
    and (
      exists (
        select 1 from program_runs
        where program_runs.program_id = legacy.id
      )
      or exists (
        select 1
        from training_records
        join program_workouts
          on program_workouts.id = training_records.workout_id
        where program_workouts.program_id = legacy.id
      )
    )
  returning legacy.id
`

const removedLegacyPrograms = await sql`
  delete from programs legacy
  where legacy.slug in (${LEGACY_PROGRAM_SLUGS[0]}, ${LEGACY_PROGRAM_SLUGS[1]})
    and not exists (
      select 1 from program_runs
      where program_runs.program_id = legacy.id
    )
    and not exists (
      select 1
      from training_records
      join program_workouts
        on program_workouts.id = training_records.workout_id
      where program_workouts.program_id = legacy.id
    )
  returning legacy.id
`

console.log(
  JSON.stringify(
    {
      program,
      ...verification,
      recordableSessions: builtToMoveProgram.durationWeeks * 3,
      hiddenLegacyPrograms: hiddenLegacyPrograms.length,
      removedLegacyPrograms: removedLegacyPrograms.length,
    },
    null,
    2,
  ),
)
