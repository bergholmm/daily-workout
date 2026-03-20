"use client"

import { Play } from "lucide-react"
import { useState } from "react"

import type { WorkoutSection } from "@/lib/types"

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
}

export function ProgramWorkoutCard({ title, content, videoUrl }: Props) {
  return (
    <div className="border border-border/50 bg-card/50 p-4">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-primary">{title}</h4>
      )}
      <div className="space-y-3">
        {content.map((section, i) => (
          <div key={i}>
            <p className="mb-1 text-sm font-semibold text-primary">
              {section.title}
            </p>
            {section.exercises.map((exercise, j) => (
              <p key={j} className="text-sm leading-relaxed text-foreground/80">
                {exercise}
              </p>
            ))}
            {section.videoUrl && <CollapsibleVideo url={section.videoUrl} />}
          </div>
        ))}
      </div>
      {videoUrl && <CollapsibleVideo url={videoUrl} />}
    </div>
  )
}
