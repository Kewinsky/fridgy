"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChefHatIcon, HeartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/demo-recipes";
import { cn } from "@/lib/utils";
import {
  changeFavorite,
  useRecipeLibrary,
} from "@/components/dashboard/use-recipe-library";

export function StartCookingButton({ recipe, className }: { recipe: Recipe; className?: string }) {
  const t = useTranslations("Recipe");
  const router = useRouter();

  function startCooking() {
    router.push(`/dashboard/gotowanie/${recipe.slug}`);
  }

  return (
    <Button className={cn("h-11", className)} onClick={startCooking}>
      <ChefHatIcon aria-hidden="true" /> {t("cook")}
    </Button>
  );
}

export function FavoriteRecipeButton({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const t = useTranslations("Recipe");
  const library = useRecipeLibrary();
  const favorite = library.favoriteSlugs.includes(slug);

  return (
    <Button
      type="button"
      variant={favorite ? "destructive" : "outline"}
      size={compact ? "icon-lg" : "default"}
      className={compact ? "size-11" : "h-11"}
      aria-label={favorite ? t("removeFavorite") : t("addFavorite")}
      aria-pressed={favorite}
      onClick={() => changeFavorite(slug)}
    >
      <HeartIcon className={cn(favorite && "fill-current")} aria-hidden="true" />
      {compact ? null : favorite ? t("favorite") : t("addFavorite")}
    </Button>
  );
}
