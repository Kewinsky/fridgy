import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BrandIcon, BrandWordmark } from "@/components/brand-icon";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatPlanPrice } from "@/lib/subscription-plans";
import { getSubscriptionPlans } from "@/lib/subscription-usage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Subscription");
  return { title: t("title"), description: t("description") };
}

export default async function PricingPage() {
  const t = await getTranslations("Subscription");
  const locale = await getLocale();
  const supabase = await createClient();
  const plans = await getSubscriptionPlans(supabase);
  const free = plans.find((plan) => plan.id === "free");
  const premium = plans.find((plan) => plan.id === "premium");
  if (!free || !premium) throw new Error("Subscription plans are missing");
  return <main className="min-h-dvh">
    <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5">
      <Link href="/" className="flex items-center gap-1"><BrandIcon name="logo" className="size-12" /><BrandWordmark className="text-2xl" /></Link>
      <LanguageSwitcher compact />
    </header>
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
      <p className="text-sm font-bold uppercase tracking-wider text-primary">{t("eyebrow")}</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{t("description")}</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <section className="app-card p-6"><h2 className="text-xl font-extrabold">{t("free")}</h2><p className="mt-3 text-3xl font-extrabold">{formatPlanPrice(free.price_monthly_grosz ?? 0, free.currency, locale)}</p><p className="mt-3 text-sm text-muted-foreground">{t("freeDescription")}</p><p className="mt-5 text-sm">{t("features.recipes")}: {free.saved_custom_recipes ?? t("unlimited")}</p><p className="mt-2 text-sm">{t("features.ai")}: {free.ai_uses_lifetime === null ? t("unlimited") : t("totalCount", { count: free.ai_uses_lifetime })}</p><p className="mt-2 text-sm">{t("features.receipts")}: {t("monthlyCount", { count: free.receipt_scans_monthly })}</p></section>
        <section className="app-card border-primary/40 p-6 ring-1 ring-primary/15"><h2 className="text-xl font-extrabold text-primary">{t("premium")}</h2><p className="mt-3 text-3xl font-extrabold">{formatPlanPrice(premium.price_monthly_grosz ?? 0, premium.currency, locale)} <span className="text-base font-medium text-muted-foreground">{t("perMonth")}</span></p><p className="mt-2 font-semibold">{formatPlanPrice(premium.price_yearly_grosz ?? 0, premium.currency, locale)} {t("perYear")}</p><p className="mt-4 text-sm">{t("trialDescription", { count: premium.trial_days })}</p><p className="mt-5 text-sm">{t("features.ai")}: {premium.ai_uses_monthly === null ? t("unlimited") : t("monthlyCount", { count: premium.ai_uses_monthly })}</p><p className="mt-2 text-sm">{t("features.receipts")}: {t("monthlyCount", { count: premium.receipt_scans_monthly })}</p><p className="mt-2 text-sm">{t("features.members")}: {premium.household_members}</p></section>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{t("paymentsComingSoon")}</p>
      <Link href="/login" className={`${buttonVariants()} mt-7 h-11`}>{t("createAccount")}</Link>
    </div>
  </main>;
}
