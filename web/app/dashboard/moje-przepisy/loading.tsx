import { RecipeCardSkeleton } from "@/components/dashboard/recipe-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecipeLibraryLoading() {
  return (
    <div aria-hidden="true">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}
      </div>
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-9 w-28 rounded-lg" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <RecipeCardSkeleton key={index} variant="library" />)}
      </div>
    </div>
  );
}
