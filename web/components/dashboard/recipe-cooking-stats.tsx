"use client";

import { CalendarClockIcon, HistoryIcon } from "lucide-react";

import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { getCookingCount } from "@/lib/recipe-library";

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "medium",
});

export function RecipeCookingStats({ slug }: { slug: string }) {
  const library = useRecipeLibrary();
  const count = getCookingCount(library, slug);
  const latest = library.history.find((record) => record.recipeSlug === slug);

  return (
    <section
      aria-label="Historia gotowania"
      className="app-card grid gap-3 p-5 sm:grid-cols-2"
    >
      <Stat
        icon={HistoryIcon}
        label="Liczba ugotowań"
        value={`${count}×`}
      />
      <Stat
        icon={CalendarClockIcon}
        label="Ostatnio ugotowano"
        value={
          latest
            ? dateFormatter.format(new Date(latest.cookedAt))
            : "Jeszcze nie gotowano"
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
