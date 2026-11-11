"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";

export type PlanLimit = "ai" | "receipt" | "recipes" | "members";

export function PlanLimitDialog({ kind, open, onOpenChange }: {
  kind: PlanLimit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Subscription");
  const { subscription } = useDashboardData();
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t("limitTitle")}</DialogTitle>
        <DialogDescription>{t(`limits.${kind}`, { count: subscription.limits.saved_custom_recipes ?? 0 })}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        <Button nativeButton={false} render={<Link href="/dashboard/premium" />}>{t("seePlans")}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}

export function RemainingUses({ kind }: { kind: "ai" | "receipt" }) {
  const t = useTranslations("Subscription");
  const { subscription } = useDashboardData();
  const used = kind === "ai" ? subscription.aiUsed : subscription.scansUsed;
  let limit: number | null = subscription.limits.receipt_scans_monthly;
  if (kind === "ai") {
    limit = subscription.plan === "free"
      ? subscription.limits.ai_uses_lifetime
      : subscription.limits.ai_uses_monthly;
  }
  if (limit === null) return null;
  return <p className="text-sm font-medium tabular-nums text-muted-foreground" aria-live="polite">
    {t(subscription.plan === "free" && kind === "ai" ? "remainingTotal" : "remainingMonthly", {
      count: Math.max(0, limit - used), total: limit,
    })}
  </p>;
}
