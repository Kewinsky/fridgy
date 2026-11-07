import { Skeleton } from "@/components/ui/skeleton";

export function RecipeDetailSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-11 w-28 rounded-lg" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-5">
          <div className="app-card overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none sm:h-64" />
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)}
            </div>
          </div>
          <div className="app-card space-y-4 p-5 sm:p-6">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-16 rounded-lg" />)}
            </div>
          </div>
          <div className="app-card space-y-4 p-5 sm:p-6">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        <div className="app-card space-y-4 p-5 sm:p-6">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-11 w-full rounded-lg" />)}
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
