import { Skeleton } from "@/components/ui/skeleton";

export function RecipeCardSkeleton() {
  return (
    <div className="app-card flex h-full flex-col p-5" aria-hidden="true">
      <Skeleton className="mb-4 h-40 w-full rounded-lg" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="size-11 shrink-0 rounded-lg" />
      </div>
      <div className="mt-auto space-y-4 pt-6">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
