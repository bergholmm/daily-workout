"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { usePrograms } from "@/lib/hooks/use-programs"

export default function ProgramsPage() {
  const { programs, isLoading } = usePrograms()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-10 sm:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programs</h1>
        <Button render={<Link href="/programs/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          New Program
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      )}

      {programs?.length === 0 && (
        <p className="text-muted-foreground">
          No programs yet. Create one to get started.
        </p>
      )}

      {programs?.map((program) => (
        <Link key={program.id} href={`/programs/${program.id}`}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>{program.name}</CardTitle>
              {program.description && (
                <CardDescription>{program.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
