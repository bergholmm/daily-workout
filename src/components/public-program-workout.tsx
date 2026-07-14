import {
  Clock3,
  Dumbbell,
  NotebookPen,
  SlidersHorizontal,
  Target,
} from "lucide-react"

import { LinkedText } from "@/components/linked-text"
import { Badge } from "@/components/ui/badge"
import { WorkoutRecordForm } from "@/components/workout-record-form"

import type { PublicProgramWorkout, WorkoutSection } from "@/lib/types"

type Props = {
  workout: PublicProgramWorkout
}

function getSectionKind(section: WorkoutSection) {
  const title = section.title.trim().toLowerCase()
  if (title.startsWith("scaling")) return "scaling"
  if (title.startsWith("record")) return "record"
  return "workout"
}

function UtilitySection({
  section,
  kind,
  workoutId,
}: {
  section: WorkoutSection
  kind: "scaling" | "record"
  workoutId: number
}) {
  const isScaling = kind === "scaling"
  const Icon = isScaling ? SlidersHorizontal : NotebookPen

  return (
    <aside
      className={
        isScaling
          ? "border border-primary/20 bg-primary/[0.04] p-4 sm:p-5"
          : "border border-border/50 bg-muted/15 p-4 sm:p-5"
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            isScaling
              ? "flex h-8 w-8 shrink-0 items-center justify-center bg-primary/10 text-primary"
              : "flex h-8 w-8 shrink-0 items-center justify-center bg-muted text-muted-foreground"
          }
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
            {isScaling ? "Adjust as needed" : "After training"}
          </p>
          <h3
            className={
              isScaling
                ? "mt-0.5 text-sm font-semibold text-primary"
                : "mt-0.5 text-sm font-semibold"
            }
          >
            {section.title}
          </h3>
        </div>
      </div>

      {isScaling ? (
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/75">
          {section.exercises.map((exercise, index) => (
            <li key={`${exercise}-${index}`} className="flex gap-2.5">
              <span className="mt-[0.15em] text-muted-foreground/60">—</span>
              <span>
                <LinkedText text={exercise} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <WorkoutRecordForm workoutId={workoutId} prompts={section.exercises} />
      )}
    </aside>
  )
}

export function PublicProgramWorkoutCard({ workout }: Props) {
  const workoutSections = workout.content.filter(
    (section) => getSectionKind(section) === "workout",
  )
  const utilitySections = workout.content.filter(
    (section) => getSectionKind(section) !== "workout",
  )

  return (
    <article className="space-y-5">
      <div className="border border-primary/25 bg-primary/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wider uppercase text-primary">
          {workout.weekNumber && <span>Week {workout.weekNumber}</span>}
          {workout.weekNumber && workout.sessionNumber && <span>·</span>}
          {workout.sessionNumber && (
            <span>Session {workout.sessionNumber}</span>
          )}
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {workout.title ?? "Daily training"}
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
        {workoutSections.map((section, index) => (
          <section
            key={`${section.title}-${index}`}
            className="border border-border/50 bg-card/50 px-4 py-4 sm:px-5"
          >
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary/10 text-[11px] font-bold text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="pt-0.5 text-sm font-semibold text-primary">
                {section.title}
              </h3>
            </div>
            <div className="space-y-1.5 pl-9">
              {section.exercises.map((exercise, exerciseIndex) => (
                <p
                  key={`${exercise}-${exerciseIndex}`}
                  className="text-sm leading-relaxed text-foreground/80"
                >
                  <LinkedText text={exercise} />
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {utilitySections.length > 0 && (
        <div className="grid gap-3 border-t border-border/50 pt-5 sm:grid-cols-2">
          {utilitySections.map((section, index) => {
            const kind = getSectionKind(section)
            if (kind === "workout") return null

            return (
              <UtilitySection
                key={`${section.title}-${index}`}
                section={section}
                kind={kind}
                workoutId={workout.id}
              />
            )
          })}
        </div>
      )}
    </article>
  )
}
