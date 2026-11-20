"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDaysIcon,
  CheckIcon,
  CircleAlertIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  FileTextIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { SubscriptionPricing } from "@/components/subscription-pricing";
import { useSubscription } from "@/components/dashboard/subscription-provider";
import { SubscriptionUsage } from "@/components/dashboard/subscription-usage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  hasPremiumAccess,
  subscriptionPlan,
  formatSubscriptionPrice,
  SUBSCRIPTION_OFFER,
  usageFeatures,
  type BillingAction,
} from "@/lib/subscription";
import { SubscriptionStatusNotice } from "@/components/dashboard/subscription-status";

export function SubscriptionSettings() {
  const t = useTranslations("Billing");
  const locale = useLocale();
  const { subscription, isOwner, householdName, openAction } =
    useSubscription();
  const { status } = subscription;
  const premium = hasPremiumAccess(status);
  const trial = status === "trialing" || status === "trial_ending";
  const plan = subscriptionPlan(status);
  const paidPlan = plan === "premium" && !trial;
  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "long",
          timeZone: "Europe/Warsaw",
        }).format(new Date(value))
      : t("dateUnknown");
  let dateLabel = t("nextPayment");
  let dateValue = subscription.renewsAt;
  if (trial) {
    dateLabel = t("trialEnds");
    dateValue = subscription.accessEndsAt;
  } else if (status === "canceling") {
    dateLabel = t("accessUntil");
    dateValue = subscription.accessEndsAt;
  } else if (status === "past_due") {
    dateLabel = t("accessUntil");
    dateValue = subscription.accessEndsAt;
  } else if (status === "expired" || status === "unpaid") {
    dateLabel = t("premiumEnded");
    dateValue = subscription.accessEndsAt;
  } else if (!premium) {
    dateLabel = t("noRenewal");
    dateValue = null;
  }

  if (status === "loading")
    return (
      <section
        aria-busy="true"
        aria-label={t("loading")}
        className="app-card space-y-5 p-6"
      >
        <p role="status" className="text-sm text-muted-foreground">
          {t("loading")}
        </p>
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-48 w-full" />
      </section>
    );
  if (status === "error")
    return (
      <section className="app-card p-8 text-center">
        <CircleAlertIcon
          className="mx-auto size-9 text-soon"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-xl font-bold">{t("loadErrorTitle")}</h2>
        <p
          role="alert"
          className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground"
        >
          {t("loadError")}
        </p>
        <Button
          className="mt-5 min-h-11"
          onClick={() => openAction({ action: "retry" })}
        >
          {t("retry")}
        </Button>
      </section>
    );

  function actionButton(
    action: BillingAction,
    label: string,
    variant: "outline" | "default" = "outline",
  ) {
    return (
      <Button
        variant={variant}
        className="min-h-11"
        onClick={() => openAction({ action })}
      >
        {label}
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      <section className="app-card overflow-hidden">
        <div className="border-b border-border bg-secondary/35 p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {householdName}
              </p>
              <h2 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-extrabold sm:text-3xl">
                Fridgy {plan === "premium" ? "Premium" : "Free"}
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">
                  {t(`statuses.${status}.title`)}
                </span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                {t("sharedPlan")}
              </p>
            </div>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheckIcon className="size-6" aria-hidden="true" />
            </span>
          </div>
        </div>
        <div className="space-y-5 p-5 sm:p-7">
          <SubscriptionStatusNotice />
          <dl className="grid gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">
                {t("billingPeriod")}
              </dt>
              <dd className="mt-2 font-bold">
                {paidPlan ? t(subscription.interval) : t("noCharge")}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <CalendarDaysIcon className="size-4" aria-hidden="true" />
                {dateLabel}
              </dt>
              <dd className="mt-2 font-bold">
                {dateValue ? date(dateValue) : t("notApplicable")}
                {dateValue && dateValue === subscription.accessEndsAt ? (
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short",
                      timeZone: "Europe/Warsaw",
                    }).format(new Date(dateValue))}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">
                {t("amount")}
              </dt>
              <dd className="mt-2 font-bold">
                {formatSubscriptionPrice(
                  paidPlan
                    ? SUBSCRIPTION_OFFER.prices[subscription.interval]
                    : 0,
                  locale,
                )}
                {paidPlan ? ` / ${t(`${subscription.interval}Short`)}` : ""}
              </dd>
            </div>
          </dl>
          {trial ? (
            <p className="rounded-xl bg-secondary/50 p-4 text-sm leading-6">
              {t("trialNote", { days: SUBSCRIPTION_OFFER.trialDays })}
            </p>
          ) : null}
          {!isOwner ? (
            <p className="rounded-xl bg-muted p-4 text-sm leading-6">
              {t("ownerOnly")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {!premium && subscription.trialAvailable
                ? actionButton(
                    "trial",
                    t("startTrial", { days: SUBSCRIPTION_OFFER.trialDays }),
                    "default",
                  )
                : null}
              {!premium || trial ? (
                <Button
                  className="min-h-11"
                  variant={trial ? "default" : "outline"}
                  nativeButton={false}
                  render={<a href="#subscription-plans" />}
                >
                  {t("seePremium")}
                </Button>
              ) : null}
              {status === "active" || status === "past_due"
                ? actionButton("cancel", t("cancelRenewal"))
                : null}
              {status === "canceling" || status === "paused"
                ? actionButton("resume", t("resume"), "default")
                : null}
            </div>
          )}
        </div>
      </section>

      <section
        className="app-card p-5 sm:p-7"
        aria-labelledby="subscription-usage-heading"
      >
        <h2 id="subscription-usage-heading" className="text-lg font-extrabold">
          {t("usageTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("usageDescription")}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {usageFeatures.map((feature) => (
            <SubscriptionUsage key={feature} feature={feature} />
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          {t("resetExplanation")}
        </p>
      </section>

      <section
        id="subscription-plans"
        className="scroll-mt-8"
        aria-labelledby="subscription-plans-heading"
      >
        <h2 id="subscription-plans-heading" className="text-xl font-extrabold">
          {t("compareTitle")}
        </h2>
        <p className="mt-2 mb-6 text-sm leading-6 text-muted-foreground">
          {t("oneHousehold")}
        </p>
        <SubscriptionPricing
          currentPlan={plan ?? undefined}
          currentInterval={paidPlan ? subscription.interval : undefined}
          canManage={isOwner}
          trialAvailable={subscription.trialAvailable && !trial}
          onSelect={(interval) =>
            openAction({
              action: paidPlan ? "interval" : "checkout",
              interval,
            })
          }
          onTrial={() => openAction({ action: "trial" })}
        />
      </section>

      {isOwner ? (
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
          <section className="app-card p-5 sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <CreditCardIcon
                className="size-5 text-primary"
                aria-hidden="true"
              />
              {t("paymentTitle")}
            </h2>
            {subscription.paymentMethod ? (
              <div className="mt-5 rounded-xl border border-border p-4">
                <p className="font-semibold">
                  {subscription.paymentMethod.brand} ····{" "}
                  {subscription.paymentMethod.last4}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("cardExpires", {
                    date: subscription.paymentMethod.expires,
                  })}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {t("noCard")}
              </p>
            )}
            <Button
              variant="outline"
              className="mt-5 min-h-11"
              onClick={() => openAction({ action: "payment" })}
            >
              {t("managePayment")}
              <ExternalLinkIcon className="size-4" aria-hidden="true" />
            </Button>
          </section>
          <section className="app-card min-w-0 p-5 sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <FileTextIcon
                className="size-5 text-primary"
                aria-hidden="true"
              />
              {t("invoicesTitle")}
            </h2>
            {subscription.invoices.length ? (
              <ul className="mt-4 divide-y divide-border">
                {subscription.invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {date(invoice.issuedAt)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {invoice.id} · {t(`invoiceStatuses.${invoice.status}`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold tabular-nums">
                        {formatSubscriptionPrice(invoice.amount, locale)}
                      </span>
                      <Button
                        variant="outline"
                        className="min-h-11"
                        onClick={() =>
                          openAction({
                            action: "invoice",
                            invoiceId: invoice.id,
                          })
                        }
                        aria-label={t("openInvoiceLabel", { id: invoice.id })}
                      >
                        {t("openInvoice")}
                        <ExternalLinkIcon
                          className="size-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-border p-5 text-center">
                <FileTextIcon
                  className="mx-auto size-7 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-semibold">{t("noInvoices")}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("invoicesNote")}
                </p>
              </div>
            )}
          </section>
        </div>
      ) : null}

      <section className="rounded-2xl border border-border p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <CheckIcon className="size-4 text-primary" aria-hidden="true" />
          {t("dataSafeTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("dataKept")}
        </p>
      </section>
    </div>
  );
}
