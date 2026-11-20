"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SubscriptionProvider } from "@/components/dashboard/subscription-provider";
import { SubscriptionSettings } from "@/components/dashboard/subscription-settings";
import {
  FREE_SUBSCRIPTION,
  SUBSCRIPTION_OFFER,
  subscriptionStatuses,
  type SubscriptionStatus,
  type SubscriptionView,
} from "@/lib/subscription";

// This component is only reachable from the development-only route.
export function SubscriptionPreview() {
  const t = useTranslations("Billing");
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [isOwner, setIsOwner] = useState(true);
  const [nearLimit, setNearLimit] = useState(false);
  const [emptyHistory, setEmptyHistory] = useState(false);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [pendingAction, setPendingAction] = useState(false);
  const subscription: SubscriptionView = {
    ...FREE_SUBSCRIPTION,
    status,
    interval,
    accessEndsAt: ["trialing", "trial_ending"].includes(status)
      ? "2026-12-04T22:59:59Z"
      : "2026-12-20T08:59:59Z",
    renewsAt: "2026-12-20T09:00:00Z",
    usageResetsAt: "2026-12-20T09:00:00Z",
    trialAvailable: status === "free",
    usage: nearLimit
      ? { recipes: 8, ai: 30, scans: 19, members: 6 }
      : { recipes: 3, ai: 4, scans: 1, members: 1 },
    paymentMethod: emptyHistory
      ? null
      : { brand: "Visa", last4: "4242", expires: "12/2029" },
    invoices: emptyHistory
      ? []
      : [
          {
            id: "FR-2026-011",
            issuedAt: "2026-11-20T09:00:00Z",
            amount: SUBSCRIPTION_OFFER.prices.monthly,
            status: "paid",
          },
          {
            id: "FR-2026-010",
            issuedAt: "2026-10-20T09:00:00Z",
            amount: SUBSCRIPTION_OFFER.prices.monthly,
            status: "open",
          },
          {
            id: "FR-2026-009",
            issuedAt: "2026-09-20T09:00:00Z",
            amount: SUBSCRIPTION_OFFER.prices.monthly,
            status: "void",
          },
        ],
  };
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-7">
      <div className="app-card flex flex-wrap items-center gap-5 p-5">
        <label className="grid gap-2 text-sm font-semibold">
          Status
          <select
            className="min-h-11 rounded-lg border border-input bg-card px-3 text-foreground"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as SubscriptionStatus)
            }
          >
            {subscriptionStatuses.map((value) => (
              <option key={value} value={value}>
                {t(`statuses.${value}.title`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isOwner}
            onChange={(event) => setIsOwner(event.target.checked)}
          />
          Owner
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={nearLimit}
            onChange={(event) => setNearLimit(event.target.checked)}
          />
          Limits
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={emptyHistory}
            onChange={(event) => setEmptyHistory(event.target.checked)}
          />
          Empty history
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={interval === "yearly"}
            onChange={(event) =>
              setInterval(event.target.checked ? "yearly" : "monthly")
            }
          />
          Annual
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pendingAction}
            onChange={(event) => setPendingAction(event.target.checked)}
          />
          Pending action
        </label>
      </div>
      <SubscriptionProvider
        key={`${status}-${isOwner}-${interval}-${pendingAction}`}
        subscription={subscription}
        isOwner={isOwner}
        householdName="Dom przy Ogrodowej"
        onAction={pendingAction ? () => new Promise<void>(() => {}) : undefined}
      >
        <SubscriptionSettings />
      </SubscriptionProvider>
    </main>
  );
}
