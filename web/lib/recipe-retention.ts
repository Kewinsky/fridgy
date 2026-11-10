import { differenceInCalendarDays } from "date-fns";

const retentionMs = 7 * 24 * 60 * 60 * 1000;

export function daysUntilRecipePruned(createdAt: string, now: Date): number | null {
  const expiry = Date.parse(createdAt) + retentionMs;
  if (!Number.isFinite(expiry) || expiry <= now.getTime()) return null;
  const days = differenceInCalendarDays(new Date(expiry), now);
  return days >= 0 && days <= 3 ? days : null;
}
