"use client";

import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { formatEstimatedDate, getFreshnessStatus } from "@/lib/demo-data";

const statuses = {
  overdue: {
    emoji: "⛔",
    labelKey: "overdueLong",
  },
  today: {
    emoji: "🔥",
    labelKey: "todayLong",
  },
  soon: {
    emoji: "⏳",
    labelKey: "soonLong",
  },
  week: {
    emoji: "🗓️",
    labelKey: "weekLong",
  },
  calm: {
    emoji: "🌿",
    labelKey: "calmLong",
  },
} as const;

export function FreshnessLabel({ date }: { date: string }) {
  const t = useTranslations("Inventory.freshness");
  const locale = useLocale();
  const status = statuses[getFreshnessStatus(date)];

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <Badge
        variant="outline"
        className="border-transparent bg-secondary text-primary"
      >
        <span aria-hidden="true">{status.emoji}</span>
        {t(status.labelKey)}
      </Badge>
      <span className="text-[11px] text-muted-foreground">
        {t("estimatedDate", { date: formatEstimatedDate(date, locale) })}
      </span>
    </span>
  );
}
