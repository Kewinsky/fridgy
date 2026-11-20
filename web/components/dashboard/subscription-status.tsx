"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CircleAlertIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/components/dashboard/subscription-provider";
import { billingSettingsPath } from "@/lib/subscription";
import { subscriptionPlan, type BillingAction } from "@/lib/subscription";
import { cn } from "@/lib/utils";

export function SubscriptionStatusNotice({
  compact = false,
}: {
  compact?: boolean;
}) {
  const t = useTranslations("Billing");
  const { subscription, isOwner, openAction } = useSubscription();
  const { status } = subscription;
  if (["free", "active", "loading", "error"].includes(status)) return null;
  const urgent = [
    "past_due",
    "unpaid",
    "incomplete",
    "incomplete_expired",
    "paused",
  ].includes(status);
  let action: BillingAction = "payment";
  if (status === "incomplete_expired") action = "checkout";
  if (status === "paused") action = "resume";
  let actionLabel = t("fixPayment");
  if (action === "checkout") actionLabel = t("choosePremium");
  if (action === "resume") actionLabel = t("resume");
  return (
    <div
      role={urgent ? "alert" : "status"}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        urgent
          ? "border-soon/40 bg-soon-soft/60"
          : "border-border bg-secondary/40",
        compact && "mb-5",
      )}
    >
      <div className="flex items-start gap-3">
        <CircleAlertIcon
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-bold">{t(`statuses.${status}.title`)}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t(`statuses.${status}.description`)}
          </p>
        </div>
      </div>
      {compact ? (
        <Button
          nativeButton={false}
          render={<Link href={billingSettingsPath} />}
          variant="outline"
          className="min-h-11 shrink-0"
        >
          {t("details")}
        </Button>
      ) : null}
      {!compact && urgent && isOwner ? (
        <Button
          variant="outline"
          className="min-h-11 shrink-0"
          onClick={() => openAction({ action })}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function SubscriptionNavLink() {
  const t = useTranslations("Billing");
  const { subscription } = useSubscription();
  const plan = subscriptionPlan(subscription.status);
  let label = "…";
  if (plan === "premium") label = "Premium";
  if (plan === "free") label = "Free";
  return (
    <Link
      href={billingSettingsPath}
      className="mb-3 flex min-h-11 items-center justify-between gap-2 rounded-xl border border-border bg-secondary/50 px-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
    >
      <span className="flex items-center gap-2">
        <SparklesIcon className="size-4" aria-hidden="true" />
        {t("planAndBilling")}
      </span>
      <span className="text-xs">{label}</span>
    </Link>
  );
}
