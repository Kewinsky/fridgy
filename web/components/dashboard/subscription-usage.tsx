"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CircleAlertIcon, ArrowUpRightIcon } from "lucide-react";

import { useSubscription } from "@/components/dashboard/subscription-provider";
import {
  hasPremiumAccess,
  SUBSCRIPTION_OFFER,
  usagePresentation,
  type UsageFeature,
  billingSettingsPath,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

export function SubscriptionUsage({
  feature,
  compact = false,
}: {
  feature: UsageFeature;
  compact?: boolean;
}) {
  const t = useTranslations("Billing");
  const locale = useLocale();
  const { subscription, isOwner } = useSubscription();
  const premium = hasPremiumAccess(subscription.status);
  const plan = premium ? "premium" : "free";
  const limit = SUBSCRIPTION_OFFER.plans[plan][feature];
  const used = subscription.usage[feature];
  const { state, percent } = usagePresentation(used, limit);
  const attention = state === "warning" || state === "reached";
  let period = t("savedLimit");
  if (feature === "ai" && !premium) period = t("lifetimeLimit");
  else if (feature === "ai" || feature === "scans") period = t("monthlyLimit");
  else if (feature === "members") period = t("householdLimit");
  const resetDate =
    subscription.usageResetsAt &&
    (feature === "scans" || (feature === "ai" && premium))
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "long",
          timeZone: "Europe/Warsaw",
        }).format(new Date(subscription.usageResetsAt))
      : null;

  return (
    <section
      className={cn(
        "min-w-0 rounded-xl border p-4",
        attention ? "border-soon/40 bg-soon-soft/60" : "border-border bg-card",
        compact && "mb-5",
      )}
      aria-label={t(`features.${feature}`)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          {attention ? (
            <CircleAlertIcon
              className="size-4 shrink-0 text-soon"
              aria-hidden="true"
            />
          ) : null}
          <span>{t(`features.${feature}`)}</span>
        </div>
        <span className="text-sm font-bold tabular-nums">
          {used === null ? t("usageUnknown") : used} /{" "}
          {limit === null ? t("unlimited") : limit}
        </span>
      </div>
      {used !== null && limit !== null ? (
        <div
          role="progressbar"
          aria-label={t(`features.${feature}`)}
          aria-valuenow={Math.min(used, limit)}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuetext={t("usageValue", { used, limit })}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full rounded-full",
              attention ? "bg-soon" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {period}
        {resetDate ? ` · ${t("resetOn", { date: resetDate })}` : ""}
      </p>
      {attention ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-soon/20 pt-3">
          <p className="text-sm leading-6">
            {t(state === "reached" ? "limitReached" : "limitNear")}
          </p>
          <Link
            href={billingSettingsPath}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t(isOwner && !premium ? "seePremium" : "manage")}
            <ArrowUpRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
