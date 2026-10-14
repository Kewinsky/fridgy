"use client";

import { CalendarClockIcon, HistoryIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { getCookingCount } from "@/lib/recipe-library";

export function RecipeCookingStats({ slug }: { slug: string }) {
  const t = useTranslations("RecipeStats");
  const format = useFormatter();
  const library = useRecipeLibrary();
  const count = getCookingCount(library, slug);
  const latest = library.history.find((record) => record.recipeSlug === slug);

  return (
    <section
      aria-label={t("label")}
      className="app-card grid gap-3 p-5 sm:grid-cols-2"
    >
      <Stat
        icon={HistoryIcon}
        label={t("count")}
        value={`${count}×`}
      />
      <Stat
        icon={CalendarClockIcon}
        label={t("lastCooked")}
        value={
          latest
            ? format.dateTime(new Date(latest.cookedAt), { dateStyle: "medium" })
            : t("never")
        }
      />
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof HistoryIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
