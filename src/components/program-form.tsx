"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  initial?: { name: string; description: string | null }
  onSubmit: (data: { name: string; description: string | null }) => void
  isSubmitting: boolean
  submitLabel: string
}

export function ProgramForm({
  initial,
  onSubmit,
  isSubmitting,
  submitLabel,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ name, description: description || null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={255}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !name.trim()}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  )
}
