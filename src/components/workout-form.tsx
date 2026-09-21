"use client"

import { ChevronDown, ChevronUp, Plus, Trash2, Video } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { ensureStableExercisePrompts } from "@/lib/program-workout-recording"
import type { ProgramExercise, WorkoutSection } from "@/lib/types"

type ExerciseInput = {
  id: string
  name: string
  promptLabel: string
  promptPlaceholder: string
}

type SectionInput = {
  title: string
  exercises: ExerciseInput[]
  videoUrl: string
  showVideo: boolean
}

function newExercise(): ExerciseInput {
  return {
    id: crypto.randomUUID(),
    name: "",
    promptLabel: "",
    promptPlaceholder: "",
  }
}

function toExerciseInput(exercise: ProgramExercise): ExerciseInput {
  return {
    id: exercise.id,
    name: exercise.name,
    promptLabel: exercise.recordPrompt?.label ?? exercise.name,
    promptPlaceholder: exercise.recordPrompt?.placeholder ?? "",
  }
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
      ? ensureStableExercisePrompts(initial.content)
          .filter((section) => "exercises" in section)
          .map((section) => ({
            title: section.title,
            exercises: section.exercises.map((exercise) =>
              toExerciseInput(exercise as ProgramExercise),
            ),
            videoUrl: section.videoUrl ?? "",
            showVideo: !!section.videoUrl,
          }))
      : [
          {
            title: "",
            exercises: [newExercise()],
            videoUrl: "",
            showVideo: false,
          },
        ],
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
      {
        title: "",
        exercises: [newExercise()],
        videoUrl: "",
        showVideo: false,
      },
    ])
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  function updateExercise(
    sectionIndex: number,
    exerciseIndex: number,
    field: keyof ExerciseInput,
    value: string,
  ) {
    setSections((current) =>
      current.map((section, currentSectionIndex) =>
        currentSectionIndex !== sectionIndex
          ? section
          : {
              ...section,
              exercises: section.exercises.map((exercise, currentIndex) =>
                currentIndex === exerciseIndex
                  ? { ...exercise, [field]: value }
                  : exercise,
              ),
            },
      ),
    )
  }

  function addExercise(sectionIndex: number) {
    setSections((current) =>
      current.map((section, currentIndex) =>
        currentIndex === sectionIndex
          ? { ...section, exercises: [...section.exercises, newExercise()] }
          : section,
      ),
    )
  }

  function removeExercise(sectionIndex: number, exerciseIndex: number) {
    setSections((current) =>
      current.map((section, currentIndex) =>
        currentIndex === sectionIndex
          ? {
              ...section,
              exercises: section.exercises.filter(
                (_, currentExerciseIndex) =>
                  currentExerciseIndex !== exerciseIndex,
              ),
            }
          : section,
      ),
    )
  }

  function moveExercise(
    sectionIndex: number,
    exerciseIndex: number,
    offset: -1 | 1,
  ) {
    setSections((current) =>
      current.map((section, currentIndex) => {
        if (currentIndex !== sectionIndex) return section
        const nextIndex = exerciseIndex + offset
        if (nextIndex < 0 || nextIndex >= section.exercises.length) {
          return section
        }
        const exercises = [...section.exercises]
        const [exercise] = exercises.splice(exerciseIndex, 1)
        exercises.splice(nextIndex, 0, exercise!)
        return { ...section, exercises }
      }),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content: WorkoutSection[] = sections
      .filter(
        (section) =>
          section.title.trim() ||
          section.exercises.some((exercise) => exercise.name.trim()),
      )
      .map((section) => ({
        title: section.title.trim(),
        exercises: section.exercises
          .filter((exercise) => exercise.name.trim())
          .map((exercise) => ({
            id: exercise.id,
            name: exercise.name.trim(),
            recordPrompt: {
              label: exercise.promptLabel.trim() || exercise.name.trim(),
              ...(exercise.promptPlaceholder.trim()
                ? { placeholder: exercise.promptPlaceholder.trim() }
                : {}),
            },
          })),
        videoUrl: section.videoUrl.trim() || null,
      }))
      .filter((section) => section.exercises.length > 0)

    onSubmit({
      date,
      title: title || null,
      content,
      videoUrl: videoUrl || null,
    })
  }

  const canSubmit =
    !isSubmitting &&
    sections.some(
      (section) =>
        section.title.trim() &&
        section.exercises.some((exercise) => exercise.name.trim()),
    )

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
            <div className="space-y-2">
              {section.exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exercise.id}
                  className="space-y-2 border border-border/40 bg-background/40 p-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={exercise.name}
                      onChange={(event) =>
                        updateExercise(
                          i,
                          exerciseIndex,
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Exercise prescription"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveExercise(i, exerciseIndex, -1)}
                      disabled={exerciseIndex === 0}
                      aria-label="Move exercise up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveExercise(i, exerciseIndex, 1)}
                      disabled={exerciseIndex === section.exercises.length - 1}
                      aria-label="Move exercise down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeExercise(i, exerciseIndex)}
                      disabled={section.exercises.length === 1}
                      aria-label="Remove exercise"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    value={exercise.promptLabel}
                    onChange={(event) =>
                      updateExercise(
                        i,
                        exerciseIndex,
                        "promptLabel",
                        event.target.value,
                      )
                    }
                    placeholder="Result prompt label, defaults to exercise"
                  />
                  <Input
                    value={exercise.promptPlaceholder}
                    onChange={(event) =>
                      updateExercise(
                        i,
                        exerciseIndex,
                        "promptPlaceholder",
                        event.target.value,
                      )
                    }
                    placeholder="Example result, optional"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => addExercise(i)}
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </Button>
            </div>
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
