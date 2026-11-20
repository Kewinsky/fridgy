"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FREE_SUBSCRIPTION,
  SUBSCRIPTION_OFFER,
  formatSubscriptionPrice,
  type BillingAction,
  type BillingInterval,
  type SubscriptionView,
} from "@/lib/subscription";

type ActionRequest = {
  action: BillingAction;
  interval?: BillingInterval;
  invoiceId?: string;
};
type SubscriptionContextValue = {
  subscription: SubscriptionView;
  isOwner: boolean;
  householdName: string;
  openAction: (request: ActionRequest) => void;
};
const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

export function SubscriptionProvider({
  children,
  subscription = FREE_SUBSCRIPTION,
  isOwner,
  householdName,
  onAction,
}: {
  children: ReactNode;
  subscription?: SubscriptionView;
  isOwner: boolean;
  householdName: string;
  onAction?: (request: ActionRequest) => Promise<void>;
}) {
  const t = useTranslations("Billing");
  const locale = useLocale();
  const [request, setRequest] = useState<ActionRequest | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const busy = useRef(false);
  const accessEnd = subscription.accessEndsAt ?? subscription.renewsAt;

  function openAction(next: ActionRequest) {
    setError(false);
    setRequest(next);
  }

  async function confirm() {
    if (!request || (!isOwner && request.action !== "retry") || busy.current)
      return;
    busy.current = true;
    setPending(true);
    setError(false);
    try {
      // shortcut: no billing mutations, supply the Stripe action handler when billing launches.
      if (!onAction) throw new Error("Billing action handler is not connected");
      await onAction(request);
      setRequest(null);
    } catch {
      setError(true);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{ subscription, isOwner, householdName, openAction }}
    >
      {children}
      <Dialog
        open={request !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setRequest(null);
        }}
      >
        <DialogContent
          className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
          showCloseButton={!pending}
        >
          <DialogHeader>
            <DialogTitle className="font-sans text-lg font-bold">
              {request ? t(`actions.${request.action}.title`) : ""}
            </DialogTitle>
            <DialogDescription>
              {request
                ? t(`actions.${request.action}.description`, {
                    days: SUBSCRIPTION_OFFER.trialDays,
                    household: householdName,
                  })
                : ""}
            </DialogDescription>
          </DialogHeader>
          {request?.action === "checkout" || request?.action === "interval" ? (
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="font-semibold">
                Fridgy Premium · {t(request.interval ?? subscription.interval)}
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {formatSubscriptionPrice(
                  SUBSCRIPTION_OFFER.prices[
                    request.interval ?? subscription.interval
                  ],
                  locale,
                )}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / {t(`${request.interval ?? subscription.interval}Short`)}
                </span>
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("checkoutNote")}
              </p>
            </div>
          ) : null}
          {request?.action === "cancel" ? (
            <div className="space-y-3 rounded-xl bg-muted p-4 text-sm leading-6">
              <p className="font-semibold">
                {t("accessUntil")}:{" "}
                {accessEnd
                  ? new Intl.DateTimeFormat(locale, {
                      dateStyle: "long",
                      timeStyle: "short",
                      timeZone: "Europe/Warsaw",
                    }).format(new Date(accessEnd))
                  : t("dateUnknown")}
              </p>
              <p>{t("dataKept")}</p>
            </div>
          ) : null}
          {!isOwner && request?.action !== "retry" ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t("ownerOnly")}
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {t("actionError")}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              className="min-h-11"
              disabled={pending}
              onClick={() => setRequest(null)}
            >
              {t("back")}
            </Button>
            <Button
              className="min-h-11"
              variant={request?.action === "cancel" ? "destructive" : "default"}
              disabled={pending || (!isOwner && request?.action !== "retry")}
              onClick={() => void confirm()}
            >
              {pending ? (
                <LoaderCircleIcon
                  className="size-4 motion-safe:animate-spin"
                  aria-hidden="true"
                />
              ) : null}
              {pending
                ? t("working")
                : request && t(`actions.${request.action}.confirm`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("SubscriptionProvider is missing");
  return context;
}
