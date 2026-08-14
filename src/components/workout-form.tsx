"use client"

import { Plus, Trash2, Video } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { WorkoutSection } from "@/lib/types"

type SectionInput = {
  title: string
  exercises: string
  videoUrl: string
  showVideo: boolean
}

type Props = {
  initial?: {
    date: string
    title: string | null
    content: WorkoutSection[]
    videoUrl: string | null
  }
  onSubmit: (data: {
    date: string
    title: string | null
    content: WorkoutSection[]
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
  const [sections, setSections] = useState<SectionInput[]>(
    initial?.content
      .filter((section) => "exercises" in section)
      .map((s) => ({
        title: s.title,
        exercises: s.exercises.join("\n"),
        videoUrl: s.videoUrl ?? "",
        showVideo: !!s.videoUrl,
      })) ?? [{ title: "", exercises: "", videoUrl: "", showVideo: false }],
  )
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "")

  function updateSection(
    index: number,
    field: keyof SectionInput,
    value: string | boolean,
  ) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    )
  }

  function addSection() {
    setSections((prev) => [
      ...prev,
      { title: "", exercises: "", videoUrl: "", showVideo: false },
    ])
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content: WorkoutSection[] = sections
      .filter((s) => s.title.trim() || s.exercises.trim())
      .map((s) => ({
        title: s.title.trim(),
        exercises: s.exercises
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        videoUrl: s.videoUrl.trim() || null,
      }))
      .filter((s) => s.exercises.length > 0)

    onSubmit({
      date,
      title: title || null,
      content,
      videoUrl: videoUrl || null,
    })
  }

  const canSubmit =
    !isSubmitting && sections.some((s) => s.title.trim() && s.exercises.trim())

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
        <Label htmlFor="title">Workout Title (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          placeholder="e.g. Lower Body"
        />
      </div>

      <div className="space-y-3">
        <Label>Sections</Label>
        {sections.map((section, i) => (
          <div
            key={i}
            className="space-y-2 border border-border/50 bg-card/30 p-3"
          >
            <div className="flex items-center gap-2">
              <Input
                value={section.title}
                onChange={(e) => updateSection(i, "title", e.target.value)}
                placeholder="Section title, e.g. Movement Prep: [3 Sets]"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={
                  section.showVideo ? "text-primary" : "text-muted-foreground"
                }
                onClick={() =>
                  updateSection(i, "showVideo", !section.showVideo)
                }
                title="Add video URL"
              >
                <Video className="h-3.5 w-3.5" />
              </Button>
              {sections.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeSection(i)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <Textarea
              value={section.exercises}
              onChange={(e) => updateSection(i, "exercises", e.target.value)}
              rows={3}
              placeholder="One exercise per line"
            />
            {section.showVideo && (
              <Input
                type="url"
                value={section.videoUrl}
                onChange={(e) => updateSection(i, "videoUrl", e.target.value)}
                placeholder="Video URL for this section"
              />
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSection}
          className="w-full"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
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
      <Button type="submit" disabled={!canSubmit}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  )
}
