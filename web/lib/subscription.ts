export const SUBSCRIPTION_OFFER = {
  currency: "PLN",
  trialDays: 14,
  warningRatio: 0.8,
  prices: { monthly: 19.99, yearly: 149.99 },
  plans: {
    free: { recipes: 5, ai: 5, scans: 2, members: 1, dailyIdea: false },
    premium: { recipes: null, ai: 30, scans: 20, members: 6, dailyIdea: true },
  },
} as const;

export const subscriptionStatuses = [
  "free",
  "trialing",
  "trial_ending",
  "active",
  "canceling",
  "expired",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
  "loading",
  "error",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];
export type BillingInterval = "monthly" | "yearly";
export const billingSettingsPath = "/dashboard/ustawienia?tab=billing";
export const billingLoginPath = `/login?next=${encodeURIComponent(billingSettingsPath)}`;
export type UsageFeature = "recipes" | "ai" | "scans" | "members";
export const usageFeatures: UsageFeature[] = [
  "recipes",
  "ai",
  "scans",
  "members",
];
export type BillingAction =
  | "checkout"
  | "trial"
  | "cancel"
  | "resume"
  | "payment"
  | "interval"
  | "retry"
  | "invoice";
export type SubscriptionView = {
  status: SubscriptionStatus;
  interval: BillingInterval;
  accessEndsAt: string | null;
  renewsAt: string | null;
  usageResetsAt: string | null;
  trialAvailable: boolean;
  usage: Record<UsageFeature, number | null>;
  paymentMethod: { brand: string; last4: string; expires: string } | null;
  invoices: {
    id: string;
    issuedAt: string;
    amount: number;
    status: "paid" | "open" | "void";
  }[];
};

// shortcut: presentation data only, replace this snapshot with server billing data when Stripe is connected.
export const FREE_SUBSCRIPTION: SubscriptionView = {
  status: "free",
  interval: "monthly",
  accessEndsAt: null,
  renewsAt: null,
  usageResetsAt: null,
  trialAvailable: true,
  usage: { recipes: null, ai: null, scans: null, members: null },
  paymentMethod: null,
  invoices: [],
};

export function hasPremiumAccess(status: SubscriptionStatus) {
  return [
    "trialing",
    "trial_ending",
    "active",
    "canceling",
    "past_due",
  ].includes(status);
}

export function usagePresentation(used: number | null, limit: number | null) {
  if (used === null) return { state: "unknown", percent: 0 } as const;
  if (limit === null) return { state: "unlimited", percent: 0 } as const;
  const percent = Math.min(100, Math.max(0, (used / limit) * 100));
  if (used >= limit) return { state: "reached", percent } as const;
  if (used / limit >= SUBSCRIPTION_OFFER.warningRatio)
    return { state: "warning", percent } as const;
  return { state: "available", percent } as const;
}

export function yearlySavingPercent() {
  return Math.round(
    (1 -
      SUBSCRIPTION_OFFER.prices.yearly /
        (SUBSCRIPTION_OFFER.prices.monthly * 12)) *
      100,
  );
}

export function subscriptionPlan(status: SubscriptionStatus) {
  if (status === "loading" || status === "error") return null;
  if (["free", "expired", "incomplete_expired"].includes(status)) return "free";
  return "premium";
}

export function formatSubscriptionPrice(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: SUBSCRIPTION_OFFER.currency,
  }).format(amount);
}
