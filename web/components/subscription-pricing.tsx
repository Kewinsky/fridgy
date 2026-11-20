"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRightIcon,
  CheckIcon,
  MinusIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SUBSCRIPTION_OFFER,
  formatSubscriptionPrice,
  usageFeatures,
  yearlySavingPercent,
  type BillingInterval,
  billingLoginPath,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

export function SubscriptionPricing({
  currentPlan,
  currentInterval,
  canManage = true,
  trialAvailable = true,
  onSelect,
  onTrial,
}: {
  currentPlan?: "free" | "premium";
  currentInterval?: BillingInterval;
  canManage?: boolean;
  trialAvailable?: boolean;
  onSelect?: (interval: BillingInterval) => void;
  onTrial?: () => void;
}) {
  const t = useTranslations("Billing");
  const locale = useLocale();
  const [interval, setInterval] = useState<BillingInterval>(
    currentInterval ?? "yearly",
  );
  const selectedPremium =
    currentPlan === "premium" && currentInterval === interval;
  let premiumAction = (
    <Button
      className="min-h-12 w-full"
      nativeButton={false}
      render={<Link href={billingLoginPath} />}
    >
      {t("choosePremium")}
      <ArrowRightIcon aria-hidden="true" />
    </Button>
  );
  if (onSelect) {
    premiumAction = (
      <Button
        className="min-h-12 w-full"
        disabled={!canManage || selectedPremium}
        onClick={() => onSelect(interval)}
      >
        {t(selectedPremium ? "currentPlan" : "choosePremium")}
        <ArrowRightIcon aria-hidden="true" />
      </Button>
    );
  }
  if (trialAvailable && currentPlan !== "premium") {
    if (onTrial) {
      premiumAction = (
        <Button
          className="min-h-12 w-full"
          disabled={!canManage}
          onClick={onTrial}
        >
          {t("startTrial", { days: SUBSCRIPTION_OFFER.trialDays })}
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      );
    } else {
      premiumAction = (
        <Button
          className="min-h-12 w-full"
          nativeButton={false}
          render={<Link href={billingLoginPath} />}
        >
          {t("startTrial", { days: SUBSCRIPTION_OFFER.trialDays })}
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      );
    }
  }
  let freeAction = (
    <Button
      variant="outline"
      className="min-h-12 w-full"
      nativeButton={false}
      render={<Link href="/login" />}
    >
      {t("startFree")}
    </Button>
  );
  if (currentPlan) {
    freeAction = (
      <p className="flex min-h-12 items-center justify-center text-sm font-semibold text-muted-foreground">
        {t(currentPlan === "free" ? "yourFreePlan" : "freeAfterCancel")}
      </p>
    );
  }

  return (
    <div className="subscription-pricing">
      <div
        role="group"
        aria-label={t("billingPeriod")}
        className="mx-auto mb-7 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-border bg-muted p-1"
      >
        {(["monthly", "yearly"] as const).map((period) => (
          <button
            key={period}
            type="button"
            aria-pressed={interval === period}
            onClick={() => setInterval(period)}
            className={cn(
              "min-h-11 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              interval === period
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(period)}
            {period === "yearly" ? (
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-primary">
                −{yearlySavingPercent()}%
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {(["free", "premium"] as const).map((plan) => {
          const premium = plan === "premium";
          const limits = SUBSCRIPTION_OFFER.plans[plan];
          let billingNote = t("freeNote");
          if (premium)
            billingNote = t(
              interval === "yearly" ? "annualNote" : "monthlyNote",
              {
                amount: formatSubscriptionPrice(
                  SUBSCRIPTION_OFFER.prices.yearly / 12,
                  locale,
                ),
              },
            );
          return (
            <article
              key={plan}
              data-plan={plan}
              className={cn(
                "relative flex min-w-0 flex-col rounded-3xl border p-6 sm:p-8",
                premium
                  ? "border-primary bg-secondary/45"
                  : "border-border bg-card",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-xl font-extrabold">
                  {premium ? (
                    <SparklesIcon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                  Fridgy {premium ? "Premium" : "Free"}
                </h3>
                {currentPlan === plan ? (
                  <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold ring-1 ring-border">
                    {t("currentPlan")}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
                {t(premium ? "premiumDescription" : "freeDescription")}
              </p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold tracking-tight">
                  {formatSubscriptionPrice(
                    premium ? SUBSCRIPTION_OFFER.prices[interval] : 0,
                    locale,
                  )}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">
                  / {t(premium ? `${interval}Short` : "monthlyShort")}
                </span>
              </p>
              <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">
                {billingNote}
              </p>
              <ul className="my-6 flex-1 space-y-4">
                {usageFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6"
                  >
                    <CheckIcon
                      className="mt-1 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block font-semibold">
                        {t(`features.${feature}`)}
                      </span>
                      <span className="text-muted-foreground">
                        {limits[feature] === null
                          ? t("unlimited")
                          : limits[feature]}{" "}
                        ·{" "}
                        {t(
                          `periods.${feature === "ai" && !premium ? "lifetime" : feature}`,
                        )}
                      </span>
                    </span>
                  </li>
                ))}
                <li className="flex items-start gap-3 text-sm leading-6">
                  {limits.dailyIdea ? (
                    <CheckIcon
                      className="mt-1 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <MinusIcon
                      className="mt-1 size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    {t("dailyIdea")}
                    <span className="block text-muted-foreground">
                      {t(limits.dailyIdea ? "dailyIncluded" : "premiumOnly")}
                    </span>
                  </span>
                </li>
              </ul>
              {premium ? premiumAction : freeAction}
            </article>
          );
        })}
      </div>
      <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
        {t("pricingNote", { days: SUBSCRIPTION_OFFER.trialDays })}
      </p>
    </div>
  );
}
