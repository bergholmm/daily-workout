import { auth } from "@clerk/nextjs/server"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  getPublicProgramBySlug,
  getVisiblePublicProgramWorkoutBySlot,
} from "@/server/db/programs"
import { listRecordedSessions } from "@/server/db/session-records"

import { PublicProgramWorkoutCard } from "@/components/public-program-workout"
import { Button } from "@/components/ui/button"

import {
  BUILT_TO_MOVE_PROGRAM_SLUG,
  getBuiltToMoveEmphasis,
  getBuiltToMoveLevel,
  getBuiltToMoveWorkoutHref,
  resolveBuiltToMoveWorkout,
} from "@/lib/built-to-move-program"

type Props = {
  params: Promise<{ week: string; session: string }>
}

function parseSlot(weekValue: string, sessionValue: string) {
  const week = Number(weekValue)
  const emphasis = getBuiltToMoveEmphasis(sessionValue)

  if (!Number.isInteger(week) || week < 1 || week > 12 || !emphasis) {
    return null
  }

  return { week, emphasis }
}

function adjacentSlot(index: number) {
  if (index < 0 || index >= 36) return null
  return {
    week: Math.floor(index / 3) + 1,
    emphasisNumber: (index % 3) + 1,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { week: weekValue, session: sessionValue } = await params
  const slot = parseSlot(weekValue, sessionValue)
  if (!slot) return { title: "Workout not found · Built to Move" }

  const workout = await getVisiblePublicProgramWorkoutBySlot(
    BUILT_TO_MOVE_PROGRAM_SLUG,
    slot.week,
    slot.emphasis.number,
  )

  return {
    title: workout?.title
      ? `${workout.title} · Built to Move`
      : `Week ${slot.week} ${slot.emphasis.name} · Built to Move`,
    description: workout?.summary,
  }
}

export default async function BuiltToMoveWorkoutPage({ params }: Props) {
  const { week: weekValue, session: sessionValue } = await params
  const slot = parseSlot(weekValue, sessionValue)
  if (!slot) notFound()

  const workout = await getVisiblePublicProgramWorkoutBySlot(
    BUILT_TO_MOVE_PROGRAM_SLUG,
    slot.week,
    slot.emphasis.number,
  )
  if (!workout) notFound()

  const level = getBuiltToMoveLevel(slot.week)
  if (!level) notFound()

  const [{ userId }, program] = await Promise.all([
    auth(),
    getPublicProgramBySlug(BUILT_TO_MOVE_PROGRAM_SLUG),
  ])
  if (!program) notFound()

  const progress = userId
    ? await listRecordedSessions(userId, program.id)
    : { run: null, records: [] }
  const recordedWeeks = new Set(
    progress.records
      .filter((record) => record.workoutId === workout.id)
      .map((record) => record.weekNumber),
  )
  const index = (slot.week - 1) * 3 + slot.emphasis.number - 1
  const previous = adjacentSlot(index - 1)
  const next = adjacentSlot(index + 1)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-8 sm:px-6 md:pb-16">
      <header className="space-y-5">
        <Link
          href={`/training?level=${level.number}&week=${slot.week}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Built to Move overview
        </Link>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-primary">
            Level {level.number} · {level.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Week {slot.week} · {slot.emphasis.name} · Suggested{" "}
            {slot.emphasis.order.toLowerCase()}
          </p>
        </div>
      </header>

      <nav
        aria-label={`${slot.emphasis.name} weeks in Level ${level.number}`}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {level.weeks.map((weekNumber) => {
          const selected = weekNumber === slot.week
          const isRecorded = recordedWeeks.has(weekNumber)

          return (
            <Button
              key={weekNumber}
              variant={selected ? "default" : "outline"}
              nativeButton={false}
              render={
                <Link
                  href={getBuiltToMoveWorkoutHref(
                    weekNumber,
                    slot.emphasis.number,
                  )}
                />
              }
            >
              {isRecorded && <Check />}
              Week {weekNumber}
            </Button>
          )
        })}
      </nav>

      <PublicProgramWorkoutCard
        workout={resolveBuiltToMoveWorkout(workout, slot.week)}
        weekNumber={slot.week}
      />

      <details className="border border-border/50 bg-card/30 p-4 text-xs text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-foreground">
          Shared training rules
        </summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            Good repetitions available means the technically good repetitions
            that you could still do. Most strength sets finish with two or three
            available.
          </li>
          <li>
            A paired block alternates two exercises with rest. It is not a fast
            superset. Rest 30–60 seconds between exercises and 60–90 seconds
            after a normal round.
          </li>
          <li>
            Rest 90–150 seconds after demanding pull-up, HSPU, or muscle-up
            work. Stop skill work when quality or joint response gets worse.
          </li>
          <li>
            Change only one progression variable at a time. Examples are load,
            repetitions, range, assistance, hold time, or movement difficulty.
          </li>
          <li>
            Sharp right-knee pinching means reduce the range, add support, use
            the fallback, or stop. The knee must feel the same or better after
            training and the next morning. A worsening pattern needs another
            physiotherapy review.
          </li>
          <li>
            Keep loaded pancake work at an effort of 5–6 out of 10. You can use
            an elevated seat in every level.
          </li>
        </ul>
      </details>

      <nav className="flex items-center justify-between gap-3 border-t border-border/50 pt-5">
        {previous ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={getBuiltToMoveWorkoutHref(
                  previous.week,
                  previous.emphasisNumber,
                )}
              />
            }
          >
            <ArrowLeft />
            Previous
          </Button>
        ) : (
          <span />
        )}

        {next ? (
          <Button
            nativeButton={false}
            render={
              <Link
                href={getBuiltToMoveWorkoutHref(next.week, next.emphasisNumber)}
              />
            }
          >
            Next
            <ArrowRight />
          </Button>
        ) : (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/training" />}
          >
            Program overview
          </Button>
        )}
      </nav>
    </div>
  )
}
