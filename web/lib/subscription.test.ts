import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  formatSubscriptionPrice,
  hasPremiumAccess,
  subscriptionStatuses,
  usagePresentation,
  yearlySavingPercent,
  subscriptionPlan,
} from "./subscription.ts";

test("usage warnings cover the threshold, reached, exceeded and unknown limits", () => {
  assert.deepEqual(usagePresentation(3, 5), {
    state: "available",
    percent: 60,
  });
  assert.deepEqual(usagePresentation(4, 5), { state: "warning", percent: 80 });
  assert.deepEqual(usagePresentation(5, 5), { state: "reached", percent: 100 });
  assert.deepEqual(usagePresentation(9, 5), { state: "reached", percent: 100 });
  assert.equal(usagePresentation(50, null).state, "unlimited");
  assert.equal(usagePresentation(null, 5).state, "unknown");
});

test("trial, paid-through cancellation and payment grace period retain Premium presentation", () => {
  for (const status of [
    "trialing",
    "trial_ending",
    "active",
    "canceling",
    "past_due",
  ] as const)
    assert.equal(hasPremiumAccess(status), true, status);
  for (const status of [
    "free",
    "expired",
    "paused",
    "unpaid",
    "incomplete",
    "incomplete_expired",
    "loading",
    "error",
  ] as const)
    assert.equal(hasPremiumAccess(status), false, status);
});

test("every subscription state has a title and explanation in all languages", () => {
  for (const locale of ["pl", "en", "de", "fr", "es"]) {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    );
    for (const status of subscriptionStatuses) {
      assert.ok(
        messages.Billing.statuses[status].title,
        `${locale}: ${status}`,
      );
      assert.ok(
        messages.Billing.statuses[status].description,
        `${locale}: ${status}`,
      );
    }
  }
});

test("prices use the offer currency across locales and annual savings are computed", () => {
  assert.equal(formatSubscriptionPrice(19.99, "en"), "PLN 19.99");
  assert.match(formatSubscriptionPrice(19.99, "pl"), /19,99/);
  assert.equal(yearlySavingPercent(), 37);
});

test("a suspended or pending Premium subscription is not labeled as a Free plan", () => {
  assert.equal(subscriptionPlan("paused"), "premium");
  assert.equal(subscriptionPlan("unpaid"), "premium");
  assert.equal(subscriptionPlan("incomplete"), "premium");
  assert.equal(subscriptionPlan("expired"), "free");
  assert.equal(subscriptionPlan("error"), null);
});
