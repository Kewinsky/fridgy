"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { getFreshnessStatus } from "@/lib/demo-data";
import { formatUserDate } from "@/lib/date-format";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";

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

export function FreshnessLabel({ date, showDate = true }: { date: string; showDate?: boolean }) {
  const t = useTranslations("Inventory.freshness");
  const { dateFormat } = useDashboardData();
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
      {showDate ? <span className="text-[11px] text-muted-foreground">
        {t("estimatedDate", { date: formatUserDate(date, dateFormat) })}
      </span> : null}
    </span>
  );
}
