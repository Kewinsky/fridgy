import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { PremiumPlans } from "@/components/dashboard/premium-plans";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionPlans } from "@/lib/subscription-usage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Subscription");
  return { title: t("title"), description: t("description") };
}

export default async function PremiumPage() {
  const t = await getTranslations("Subscription");
  const supabase = await createClient();
  const plans = await getSubscriptionPlans(supabase);
  const free = plans.find((plan) => plan.id === "free");
  const premium = plans.find((plan) => plan.id === "premium");
  if (!free || !premium) throw new Error("Subscription plans are missing");
  return <div className="space-y-5 pb-8">
    <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
    <PremiumPlans free={free} premium={premium} testMode={process.env.NODE_ENV === "development"} />
  </div>;
}
