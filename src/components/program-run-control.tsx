"use client"

import { RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function ProgramRunControl({ completed }: { completed: boolean }) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  async function startNewRun() {
    const message = completed
      ? "Start a new Built to Move run? Your completed run will stay in your history."
      : "Restart Built to Move? Your current records will stay in your history, but the program page will start from Week 1."
    if (!window.confirm(message)) return

    setIsStarting(true)
    try {
      const response = await fetch("/api/program-runs", { method: "POST" })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Could not start a new run")
      }

      toast.success("New Built to Move run started")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start a new run",
      )
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={startNewRun}
      disabled={isStarting}
    >
      <RotateCcw />
      {completed ? "Start a new run" : "Restart run"}
    </Button>
  )
}
