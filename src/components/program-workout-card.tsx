"use client"

import { Play } from "lucide-react"
import { type ReactNode, useState } from "react"

import {
  getExerciseName,
  getExerciseSearchUrl,
  isProgramExercise,
} from "@/lib/program-workout-recording"
import type { ProgramExercise, WorkoutSection } from "@/lib/types"

import { VideoPlayer } from "./video-player"

function CollapsibleVideo({ url }: { url: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80"
      >
        <Play className="h-3 w-3" />
        {open ? "Hide video" : "Watch video"}
      </button>
      {open && (
        <div className="mt-1">
          <VideoPlayer url={url} />
        </div>
      )}
    </div>
  )
}

type Props = {
  title: string | null
  content: WorkoutSection[]
  videoUrl: string | null
  exerciseAddon?: (exercise: ProgramExercise) => ReactNode
}

export function ProgramWorkoutCard({
  title,
  content,
  videoUrl,
  exerciseAddon,
}: Props) {
  return (
    <div className="border border-border/50 bg-card/50 p-4">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-primary">{title}</h4>
      )}
      <div className="space-y-3">
        {content.map((section, i) => {
          if (!("exercises" in section)) return null

          return (
            <div key={i}>
              <p className="mb-1 text-sm font-semibold text-primary">
                {section.title}
              </p>
              {section.exercises.map((exercise, j) => (
                <div
                  key={isProgramExercise(exercise) ? exercise.id : j}
                  className="py-1"
                >
                  {isProgramExercise(exercise) &&
                  exercise.youtubeSearch !== null ? (
                    <a
                      href={getExerciseSearchUrl(
                        exercise.youtubeSearch ?? exercise.name,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm leading-relaxed text-foreground/80 underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                    >
                      {exercise.name}
                    </a>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {getExerciseName(exercise)}
                    </p>
                  )}
                  {isProgramExercise(exercise) && exerciseAddon?.(exercise)}
                </div>
              ))}
              {section.videoUrl && <CollapsibleVideo url={section.videoUrl} />}
            </div>
          )
        })}
      </div>
      {videoUrl && <CollapsibleVideo url={videoUrl} />}
    </div>
  )
}
