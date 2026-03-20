"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { SEPARATOR } from "@/lib/constants"

type Props = {
  initial?: {
    date: string
    title: string | null
    content: string[]
    videoUrl: string | null
  }
  onSubmit: (data: {
    date: string
    title: string | null
    content: string[]
    videoUrl: string | null
  }) => void
  isSubmitting: boolean
  submitLabel: string
}

export function WorkoutForm({
  initial,
  onSubmit,
  isSubmitting,
  submitLabel,
}: Props) {
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().split("T")[0]!,
  )
  const [title, setTitle] = useState(initial?.title ?? "")
  const [contentText, setContentText] = useState(
    initial?.content.join("\n").replaceAll(SEPARATOR, "") ?? "",
  )
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const lines = contentText
      .split("\n")
      .map((l) => l.trim())
      .map((l) => (l === "" ? SEPARATOR : l))
      .filter((l, i, arr) => !(l === SEPARATOR && i === arr.length - 1))

    onSubmit({
      date,
      title: title || null,
      content: lines.filter(Boolean),
      videoUrl: videoUrl || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Workout Content</Label>
        <Textarea
          id="content"
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
          rows={10}
          required
          placeholder="Enter workout content. Use blank lines to separate sections."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video URL (optional)</Label>
        <Input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://stream.mux.com/..."
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !contentText.trim()}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  )
}
