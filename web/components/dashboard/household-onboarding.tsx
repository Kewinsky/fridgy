"use client";

import Link from "next/link";
import { CheckIcon, ChefHatIcon, HomeIcon, ReceiptTextIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { signOut } from "@/app/dashboard/actions";
import { HouseholdCreationForm } from "@/components/dashboard/household-switcher";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function HouseholdOnboarding() {
  const t = useTranslations("Dashboard.onboarding");
  const navigation = useTranslations("Navigation");

  return (
    <main className="min-h-dvh bg-background px-4 py-8 text-foreground sm:px-7 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 text-xl font-extrabold text-primary">Fridgy</p>
        <section className="relative overflow-hidden rounded-2xl bg-surface-strong p-6 text-surface-strong-foreground sm:p-10">
          <div className="strong-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold text-surface-strong-accent">{t("stepsEyebrow")}</p>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">{t("welcomeTitle")}</h1>
              <p className="mt-4 max-w-md leading-7 text-surface-strong-foreground/80">{t("welcomeDescription")}</p>
            </div>
            <OnboardingSteps hasHousehold={false} hasProducts={false} hasCooked={false} />
          </div>
        </section>
      </div>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">{t("modalTitle")}</DialogTitle>
            <DialogDescription>{t("modalDescription")}</DialogDescription>
          </DialogHeader>
          <HouseholdCreationForm />
          <form action={signOut} className="text-center">
            <Button type="submit" variant="ghost">{navigation("signOut")}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export function OnboardingSteps({ hasHousehold, hasProducts, hasCooked }: {
  hasHousehold: boolean;
  hasProducts: boolean;
  hasCooked: boolean;
}) {
  const t = useTranslations("Dashboard.onboarding");
  const steps = [
    { title: t("stepHousehold"), icon: HomeIcon, done: hasHousehold, href: null },
    { title: t("stepReceipt"), icon: ReceiptTextIcon, done: hasProducts, href: hasHousehold ? "/dashboard/dodaj-produkty" : null },
    { title: t("stepCook"), icon: ChefHatIcon, done: hasCooked, href: hasHousehold && hasProducts ? "/dashboard/co-ugotowac" : null },
  ];

  return (
    <section className="min-w-0 rounded-2xl border border-surface-strong-foreground/15 bg-surface-strong-foreground/10 p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-surface-strong-accent">{t("stepsEyebrow")}</p>
      <h2 className="mt-1 text-xl font-extrabold">{t("stepsTitle")}</h2>
      <ol className="mt-5 space-y-2">
        {steps.map(({ title, icon: Icon, done, href }, index) => {
          const content = (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-strong-foreground/15 text-surface-strong-accent">
                {done ? <CheckIcon className="size-5" aria-hidden="true" /> : <Icon className="size-5" aria-hidden="true" />}
              </span>
              <span className="min-w-0 flex-1 font-semibold">{index + 1}. {title}</span>
              {done ? <span className="text-xs text-surface-strong-accent">{t("done")}</span> : null}
            </>
          );
          return (
            <li key={title}>
              {href && !done ? (
                <Link href={href} className="flex min-h-14 items-center gap-3 rounded-xl border border-surface-strong-accent/50 bg-surface-strong-foreground/10 px-3 py-2 transition-colors hover:bg-surface-strong-foreground/20 focus-visible:outline-2 focus-visible:outline-ring">
                  {content}
                </Link>
              ) : (
                <div className="flex min-h-14 items-center gap-3 rounded-xl border border-surface-strong-foreground/10 px-3 py-2">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
