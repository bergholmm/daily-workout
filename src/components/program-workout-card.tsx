"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { SEPARATOR } from "@/lib/constants"

import { VideoPlayer } from "./video-player"

type Props = {
  title: string | null
  content: string[]
  videoUrl: string | null
}

export function ProgramWorkoutCard({ title, content, videoUrl }: Props) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "" : "pt-6"}>
        {content.map((line, i) => (
          <p key={i}>{line === SEPARATOR ? <br /> : line}</p>
        ))}
        {videoUrl && (
          <div className="mt-4">
            <VideoPlayer url={videoUrl} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
