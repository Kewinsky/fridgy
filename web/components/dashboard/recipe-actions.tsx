"use client";

import { useRouter } from "next/navigation";
import { ChefHatIcon, HeartIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/demo-recipes";
import { cn } from "@/lib/utils";
import {
  changeFavorite,
  recordCooking,
  useRecipeLibrary,
} from "@/components/dashboard/use-recipe-library";

export function StartCookingButton({ recipe, className }: { recipe: Recipe; className?: string }) {
  const router = useRouter();

  function startCooking() {
    recordCooking(recipe);
    toast.success("Dodano do historii gotowania");
    router.push(`/dashboard/gotowanie/${recipe.slug}`);
  }

  return (
    <Button className={cn("h-11", className)} onClick={startCooking}>
      <ChefHatIcon aria-hidden="true" /> Gotuj!
    </Button>
  );
}

export function FavoriteRecipeButton({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const library = useRecipeLibrary();
  const favorite = library.favoriteSlugs.includes(slug);

  return (
    <Button
      type="button"
      variant={favorite ? "destructive" : "outline"}
      size={compact ? "icon-lg" : "default"}
      className={compact ? "size-11" : "h-11"}
      aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      aria-pressed={favorite}
      onClick={() => changeFavorite(slug)}
    >
      <HeartIcon className={cn(favorite && "fill-current")} aria-hidden="true" />
      {compact ? null : favorite ? "W ulubionych" : "Dodaj do ulubionych"}
    </Button>
  );
}
