import { Badge } from "@/components/ui/badge";
import { formatEstimatedDate, getFreshnessStatus } from "@/lib/demo-data";

const statuses = {
  overdue: {
    label: "Po szacowanym terminie",
    className: "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200",
  },
  today: {
    label: "Wykorzystaj dzisiaj",
    className: "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-200",
  },
  soon: {
    label: "Wykorzystaj wkrótce",
    className: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  },
  week: {
    label: "Zaplanuj na ten tydzień",
    className: "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
  },
  calm: {
    label: "Na spokojnie",
    className: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  },
} as const;

export function FreshnessLabel({ date }: { date: string }) {
  const status = statuses[getFreshnessStatus(date)];

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <Badge variant="outline" className={status.className}>
        {status.label}
      </Badge>
      <span className="text-[11px] text-muted-foreground">
        Szacowany termin: {formatEstimatedDate(date)}
      </span>
    </div>
  );
}
