"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckIcon, CrownIcon } from "lucide-react";
import { toast } from "sonner";
import { startPremiumTrial, setTestPremium } from "@/app/dashboard/subscription-actions";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { Button } from "@/components/ui/button";
import { formatPlanPrice, type SubscriptionPlan } from "@/lib/subscription-plans";

export function PremiumPlans({ free, premium, testMode }: {
  free: SubscriptionPlan;
  premium: SubscriptionPlan;
  testMode: boolean;
}) {
  const t = useTranslations("Subscription");
  const locale = useLocale();
  const router = useRouter();
  const { householdId, isHouseholdOwner, subscription, refreshSubscription } = useDashboardData();
  const [busy, setBusy] = useState(false);
  const aiLimit = subscription.plan === "free" ? subscription.limits.ai_uses_lifetime : subscription.limits.ai_uses_monthly;
  const monthly = (count: number | null) => count === null ? t("unlimited") : t("monthlyCount", { count });
  const total = (count: number | null) => count === null ? t("unlimited") : t("totalCount", { count });
  const rows = [
    [t("features.inventory"), t("unlimited"), t("unlimited")],
    [t("features.recipes"), free.saved_custom_recipes === null ? t("unlimited") : String(free.saved_custom_recipes), premium.saved_custom_recipes === null ? t("unlimited") : String(premium.saved_custom_recipes)],
    [t("features.ai"), total(free.ai_uses_lifetime), monthly(premium.ai_uses_monthly)],
    [t("features.receipts"), t("monthlyCount", { count: free.receipt_scans_monthly }), t("monthlyCount", { count: premium.receipt_scans_monthly })],
    [t("features.daily"), free.daily_ideas_per_day ? t("dailyCount", { count: free.daily_ideas_per_day }) : t("none"), premium.daily_ideas_per_day ? t("dailyCount", { count: premium.daily_ideas_per_day }) : t("none")],
    [t("features.members"), String(free.household_members), String(premium.household_members)],
  ];

  async function startTrial() {
    setBusy(true);
    try {
      const result = await startPremiumTrial(householdId);
      if (!result.started) { toast.error(t("trialUnavailable")); return; }
      await refreshSubscription();
      router.refresh();
      toast.success(t("trialStarted"));
    } catch { toast.error(t("changeFailed")); }
    finally { setBusy(false); }
  }

  async function toggleTest() {
    setBusy(true);
    try {
      await setTestPremium(householdId, subscription.source !== "test");
      await refreshSubscription();
      router.refresh();
      toast.success(t("testChanged"));
    } catch { toast.error(t("changeFailed")); }
    finally { setBusy(false); }
  }

  return <>
    <section className="grid gap-4 md:grid-cols-2">
      <div className="app-card p-6">
        <p className="text-sm font-bold text-primary">{t("free")}</p>
        <h2 className="mt-2 text-3xl font-extrabold">{formatPlanPrice(free.price_monthly_grosz ?? 0, free.currency, locale)}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{t("freeDescription")}</p>
      </div>
      <div className="app-card border-primary/40 p-6 ring-1 ring-primary/15">
        <p className="flex items-center gap-2 text-sm font-bold text-primary"><CrownIcon className="size-4" aria-hidden="true" />{t("premium")}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <h2 className="text-3xl font-extrabold">{formatPlanPrice(premium.price_monthly_grosz ?? 0, premium.currency, locale)}<span className="text-base font-medium text-muted-foreground"> {t("perMonth")}</span></h2>
          <p className="font-semibold">{formatPlanPrice(premium.price_yearly_grosz ?? 0, premium.currency, locale)} {t("perYear")}</p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t("trialDescription", { count: premium.trial_days })}</p>
        {subscription.plan === "premium" ? <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary"><CheckIcon className="size-4" aria-hidden="true" />{t("activeUntil", { date: new Date(subscription.premiumUntil ?? 0) })}</p> : null}
        {subscription.plan === "free" && subscription.trialUsed ? <p className="mt-4 text-sm text-muted-foreground">{t("trialUsed")}</p> : null}
        {isHouseholdOwner && !subscription.trialUsed && subscription.plan === "free" ? <Button className="mt-5 h-11" disabled={busy} onClick={() => void startTrial()}>{t("startTrial", { count: premium.trial_days })}</Button> : null}
        <p className="mt-4 text-xs text-muted-foreground">{t("paymentsComingSoon")}</p>
      </div>
    </section>
    <section className="app-card overflow-x-auto p-5 sm:p-6">
      <h2 className="text-lg font-extrabold">{t("compare")}</h2>
      <table className="mt-4 w-full min-w-[34rem] text-left text-sm">
        <thead><tr className="border-b border-border"><th className="py-3 pr-4">{t("feature")}</th><th className="p-3">{t("free")}</th><th className="p-3">{t("premium")}</th></tr></thead>
        <tbody>{rows.map(([label, freeValue, premiumValue]) => <tr key={label} className="border-b border-border last:border-0"><th scope="row" className="py-3 pr-4 font-medium">{label}</th><td className="p-3">{freeValue}</td><td className="p-3 font-semibold">{premiumValue}</td></tr>)}</tbody>
      </table>
    </section>
    <section className="app-card p-5 sm:p-6">
      <h2 className="text-lg font-extrabold">{t("usageTitle")}</h2>
      <p className="mt-2 text-sm">{t(subscription.plan === "free" ? "freeStatus" : "premiumStatus")}</p>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <p>{aiLimit === null ? t("aiUnlimited") : t("aiRemaining", { count: Math.max(0, aiLimit - subscription.aiUsed) })}</p>
        <p>{t("scanRemaining", { count: Math.max(0, subscription.limits.receipt_scans_monthly - subscription.scansUsed) })}</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("monthlyReset", { date: new Date(subscription.monthlyResetAt) })}</p>
      {testMode && isHouseholdOwner && (subscription.source === "test" || subscription.plan === "free") ? <Button variant="outline" className="mt-5" disabled={busy} onClick={() => void toggleTest()}>{t(subscription.source === "test" ? "disableTest" : "enableTest")}</Button> : null}
    </section>
  </>;
}
