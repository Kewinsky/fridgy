export type SubscriptionPlan = {
  id: "free" | "premium";
  price_monthly_grosz: number | null;
  price_yearly_grosz: number | null;
  currency: string;
  trial_days: number;
  saved_custom_recipes: number | null;
  ai_uses_lifetime: number | null;
  ai_uses_monthly: number | null;
  receipt_scans_monthly: number;
  daily_ideas_per_day: number;
  household_members: number;
};

export type SubscriptionState = {
  plan: "free" | "premium";
  source: "trial" | "stripe" | "test" | null;
  premiumUntil: string | null;
  trialUsed: boolean;
  aiUsed: number;
  scansUsed: number;
  customRecipes: number;
  members: number;
  monthlyResetAt: string;
  limits: SubscriptionPlan;
};

export function formatPlanPrice(grosz: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(grosz / 100);
}
