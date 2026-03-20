"use client"

import { CalendarX } from "lucide-react"
import { type ReactNode, useEffect } from "react"
import { toast } from "sonner"

import type { ProviderName } from "@/server/db/schema"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { BREAK, SEPARATOR } from "@/lib/constants"
import { useWorkout } from "@/lib/hooks/use-workout"
import { getDateStr } from "@/lib/utils"

type Props = {
  providerName: ProviderName
  date: Date | undefined
}

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g

function renderLineWithLinks(line: string): ReactNode {
  const parts: ReactNode[] = []
  let lastIndex = 0

  for (const match of line.matchAll(LINK_RE)) {
    const [full, text, url] = match
    const index = match.index!
    if (index > lastIndex) {
      parts.push(line.slice(lastIndex, index))
    }
    parts.push(
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60"
      >
        {text}
      </a>,
    )
    lastIndex = index + full!.length
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex))
  }

  return parts.length > 0 ? parts : line
}

function WorkoutContent({ content }: { content: string[] }) {
  // Group content into sections split by SEPARATOR
  const sections: string[][] = []
  let current: string[] = []

  for (const line of content) {
    if (line === SEPARATOR) {
      if (current.length) sections.push(current)
      current = []
    } else {
      current.push(line)
    }
  }
  if (current.length) sections.push(current)

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i} className="border border-border/50 bg-card/50 px-4 py-3">
          {section.map((line, j) => {
            if (line === BREAK) {
              return <div key={j} className="h-2" />
            }
            // First line of a section is often a title/header
            if (j === 0 && section.length > 1) {
              return (
                <p key={j} className="mb-1 text-sm font-semibold text-primary">
                  {renderLineWithLinks(line)}
                </p>
              )
            }
            return (
              <p key={j} className="text-sm leading-relaxed text-foreground/80">
                {renderLineWithLinks(line)}
              </p>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function WorkoutCard({ providerName, date }: Props) {
  const { workout, isLoading, error } = useWorkout(
    providerName,
    getDateStr(date),
  )

  useEffect(() => {
    if (error && error.message !== "Not Found") {
      toast.error(
        "An error occurred while fetching the workout. Please try again later.",
        { duration: 5000 },
      )
    }
  }, [error])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-32" />
        <Skeleton className="h-20" />
      </div>
    )
  }

  if (error && error.info === "Workout not found") {
    return (
      <Empty className="h-32 border border-dashed border-border/50">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarX />
          </EmptyMedia>
          <EmptyTitle>No workout found</EmptyTitle>
          <EmptyDescription>
            No workout available for this date.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!workout) return null

  return <WorkoutContent content={workout.content} />
}
