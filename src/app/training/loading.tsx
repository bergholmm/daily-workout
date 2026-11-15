import { Skeleton } from "@/components/ui/skeleton"

// Shown at once while a training page loads its data, for this route and
// the nested workout pages.
export default function TrainingLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading training"
      className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-24 pt-8 sm:px-6 md:pb-16"
    >
      <Skeleton className="h-56" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    </div>
  )
}
