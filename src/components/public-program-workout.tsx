import {
  Clock3,
  Dumbbell,
  ExternalLink,
  NotebookPen,
  Target,
} from "lucide-react"

import { LinkedText } from "@/components/linked-text"
import { SessionRecordForm } from "@/components/session-record-form"
import { Badge } from "@/components/ui/badge"

import {
  getBuiltToMoveEmphasis,
  getMovementSearchUrl,
} from "@/lib/built-to-move-program"
import {
  getExerciseName,
  isProgramExercise,
} from "@/lib/program-workout-recording"
import type {
  LegacyWorkoutSection,
  ResolvedPublicProgramWorkout,
  ResolvedWorkoutSection,
  SessionRecordSection,
} from "@/lib/types"

type Props = {
  workout: ResolvedPublicProgramWorkout
  weekNumber: number
}

function isResolvedSection(
  section: ResolvedPublicProgramWorkout["content"][number],
): section is ResolvedWorkoutSection {
  return "movements" in section
}

function isRecordSection(
  section: ResolvedPublicProgramWorkout["content"][number],
): section is SessionRecordSection {
  return "kind" in section && section.kind === "record" && "fields" in section
}

function isLegacySection(
  section: ResolvedPublicProgramWorkout["content"][number],
): section is LegacyWorkoutSection {
  return "exercises" in section
}

function StructuredSection({
  section,
  index,
}: {
  section: ResolvedWorkoutSection
  index: number
}) {
  return (
    <section className="border border-border/50 bg-card/50 px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary/10 text-[11px] font-bold text-primary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="pt-0.5 text-sm font-semibold text-primary">
            {section.title}
          </h3>
          {section.prescription && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {section.prescription}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 divide-y divide-border/40 pl-9">
        {section.movements.map((movement) => (
          <div key={movement.id} className="py-3 first:pt-0 last:pb-0">
            <a
              href={getMovementSearchUrl(movement.name)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline decoration-primary/60 underline-offset-4 transition-colors hover:text-primary"
            >
              {movement.name}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Search YouTube</span>
            </a>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">
              {movement.prescription}
            </p>
            {movement.notes?.map((note) => (
              <p
                key={note}
                className="mt-1 text-xs leading-relaxed text-muted-foreground"
              >
                {note}
              </p>
            ))}
            {movement.scaling && movement.scaling.length > 0 && (
              <div className="mt-2 border-l border-primary/40 pl-3">
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-primary">
                  Adjust
                </p>
                {movement.scaling.map((instruction) => (
                  <p
                    key={instruction}
                    className="mt-1 text-xs leading-relaxed text-muted-foreground"
                  >
                    {instruction}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {section.notes && section.notes.length > 0 && (
        <div className="mt-4 border-t border-border/40 pt-3 pl-9 text-xs leading-relaxed text-muted-foreground">
          {section.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      )}
    </section>
  )
}

function LegacySection({
  section,
  index,
}: {
  section: LegacyWorkoutSection
  index: number
}) {
  return (
    <section className="border border-border/50 bg-card/50 px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary/10 text-[11px] font-bold text-primary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="pt-0.5 text-sm font-semibold text-primary">
          {section.title}
        </h3>
      </div>
      <div className="space-y-1.5 pl-9">
        {section.exercises.map((exercise) => (
          <p
            key={isProgramExercise(exercise) ? exercise.id : exercise}
            className="text-sm leading-relaxed text-foreground/80"
          >
            <LinkedText text={getExerciseName(exercise)} />
          </p>
        ))}
      </div>
    </section>
  )
}

export function PublicProgramWorkoutCard({ workout, weekNumber }: Props) {
  const emphasis = workout.emphasisNumber
    ? getBuiltToMoveEmphasis(workout.emphasisNumber)
    : undefined
  const trainingSections = workout.content.filter(
    (section) => isResolvedSection(section) || isLegacySection(section),
  )
  const recordSection = workout.content.find(isRecordSection)

  return (
    <article className="space-y-5">
      <div className="border border-primary/25 bg-primary/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wider uppercase text-primary">
          <span>Week {weekNumber}</span>
          {workout.emphasisNumber && <span>·</span>}
          {workout.emphasisNumber && (
            <span>{emphasis?.name ?? `Workout ${workout.emphasisNumber}`}</span>
          )}
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {workout.title ?? "Training session"}
        </h2>
        {workout.summary && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/70">
            {workout.summary}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {workout.durationMinutes && (
            <Badge variant="outline">
              <Clock3 data-icon="inline-start" />
              {workout.durationMinutes} min
            </Badge>
          )}
          {workout.focus.map((focus) => (
            <Badge key={focus} variant="secondary">
              <Target data-icon="inline-start" />
              {focus}
            </Badge>
          ))}
        </div>

        {workout.equipment.length > 0 && (
          <div className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Dumbbell className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{workout.equipment.join(" · ")}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {trainingSections.map((section, index) =>
          isResolvedSection(section) ? (
            <StructuredSection
              key={section.id}
              section={section}
              index={index}
            />
          ) : (
            <LegacySection
              key={`${section.title}-${index}`}
              section={section}
              index={index}
            />
          ),
        )}
      </div>

      {recordSection && (
        <aside className="border border-border/50 bg-muted/15 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-muted text-muted-foreground">
              <NotebookPen className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                After training
              </p>
              <h3 className="mt-0.5 text-sm font-semibold">Record results</h3>
            </div>
          </div>
          <SessionRecordForm
            workoutId={workout.id}
            weekNumber={weekNumber}
            fields={recordSection.fields}
          />
        </aside>
      )}
    </article>
  )
}
