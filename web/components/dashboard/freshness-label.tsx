import { Badge } from "@/components/ui/badge";
import { formatEstimatedDate, getFreshnessStatus } from "@/lib/demo-data";

const statuses = {
  overdue: {
    emoji: "⛔",
    label: "Po szacowanym terminie",
  },
  today: {
    emoji: "🔥",
    label: "Wykorzystaj dzisiaj",
  },
  soon: {
    emoji: "⏳",
    label: "Wykorzystaj wkrótce",
  },
  week: {
    emoji: "🗓️",
    label: "Zaplanuj na ten tydzień",
  },
  calm: {
    emoji: "🌿",
    label: "Na spokojnie",
  },
} as const;

export function FreshnessLabel({ date }: { date: string }) {
  const status = statuses[getFreshnessStatus(date)];

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <Badge
        variant="outline"
        className="border-transparent bg-secondary text-primary"
      >
        <span aria-hidden="true">{status.emoji}</span>
        {status.label}
      </Badge>
      <span className="text-[11px] text-muted-foreground">
        Szacowany termin: {formatEstimatedDate(date)}
      </span>
    </span>
  );
}
