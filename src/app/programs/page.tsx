"use client"

import { formatDistanceToNow } from "date-fns"
import { ChevronRight, Dumbbell, Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { usePrograms } from "@/lib/hooks/use-programs"

export default function ProgramsPage() {
  const { programs, isLoading } = usePrograms()
  const activePrograms = programs?.filter((program) => !program.archivedAt)
  const archivedPrograms = programs?.filter((program) => program.archivedAt)

  function programLink(
    program: NonNullable<typeof programs>[number],
    archived = false,
  ) {
    return (
      <Link
        key={program.id}
        href={`/programs/${program.id}`}
        className="group flex items-center justify-between border border-border/50 bg-card/50 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-card"
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{program.name}</h3>
            {archived && (
              <span className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground">
                Archived
              </span>
            )}
          </div>
          {program.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {program.description}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            Updated{" "}
            {formatDistanceToNow(new Date(program.updatedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Manage
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Programs</h1>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/programs/new" />}
        >
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {programs?.length === 0 && (
        <Empty className="h-32 border border-dashed border-border/50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Dumbbell />
            </EmptyMedia>
            <EmptyTitle>No programs yet</EmptyTitle>
            <EmptyDescription>Create one to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {activePrograms?.map((program) => programLink(program))}
      </div>

      {Boolean(archivedPrograms?.length) && (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold">Archived</h2>
            <p className="text-xs text-muted-foreground">
              Kept because workout history refers to this content.
            </p>
          </div>
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {archivedPrograms?.map((program) => programLink(program, true))}
          </div>
        </section>
      )}
    </div>
  )
}
