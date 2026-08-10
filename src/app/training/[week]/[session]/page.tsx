import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getVisiblePublicProgramWorkoutBySlot } from "@/server/db/programs"

import { PublicProgramWorkoutCard } from "@/components/public-program-workout"
import { Button } from "@/components/ui/button"

import {
  CAPABLE_PROGRAM_SLUG,
  getCapablePhase,
  getCapableSession,
  getCapableWorkoutHref,
} from "@/lib/capable-program"

type Props = {
  params: Promise<{ week: string; session: string }>
}

function parseSlot(weekValue: string, sessionValue: string) {
  const week = Number(weekValue)
  const session = getCapableSession(sessionValue)

  if (!Number.isInteger(week) || week < 1 || week > 12 || !session) {
    return null
  }

  return { week, session }
}

function adjacentSlot(index: number) {
  if (index < 0 || index >= 36) return null
  return {
    week: Math.floor(index / 3) + 1,
    sessionNumber: (index % 3) + 1,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { week: weekValue, session: sessionValue } = await params
  const slot = parseSlot(weekValue, sessionValue)
  if (!slot) return { title: "Workout not found · CAPABLE" }

  const workout = await getVisiblePublicProgramWorkoutBySlot(
    CAPABLE_PROGRAM_SLUG,
    slot.week,
    slot.session.number,
  )

  return {
    title: workout?.title
      ? `${workout.title} · CAPABLE`
      : `Week ${slot.week} ${slot.session.name} · CAPABLE`,
    description: workout?.summary,
  }
}

export default async function CapableWorkoutPage({ params }: Props) {
  const { week: weekValue, session: sessionValue } = await params
  const slot = parseSlot(weekValue, sessionValue)
  if (!slot) notFound()

  const workout = await getVisiblePublicProgramWorkoutBySlot(
    CAPABLE_PROGRAM_SLUG,
    slot.week,
    slot.session.number,
  )
  if (!workout) notFound()

  const phase = getCapablePhase(slot.week)
  const index = (slot.week - 1) * 3 + slot.session.number - 1
  const previous = adjacentSlot(index - 1)
  const next = adjacentSlot(index + 1)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-8 sm:px-6 md:pb-16">
      <header className="space-y-5">
        <Link
          href={`/training#phase-${phase?.number ?? 1}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All CAPABLE workouts
        </Link>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-primary">
            Phase {phase?.number} · {phase?.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Week {slot.week} · {slot.session.name} · Suggested{" "}
            {slot.session.rhythm}
          </p>
        </div>
      </header>

      <PublicProgramWorkoutCard workout={workout} />

      <nav className="flex items-center justify-between gap-3 border-t border-border/50 pt-5">
        {previous ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={getCapableWorkoutHref(
                  previous.week,
                  previous.sessionNumber,
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
                href={getCapableWorkoutHref(next.week, next.sessionNumber)}
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
