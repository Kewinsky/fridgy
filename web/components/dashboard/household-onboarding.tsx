"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, ChefHatIcon, HomeIcon, ReceiptTextIcon, UsersIcon } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";
import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HouseholdCreationForm } from "@/components/dashboard/household-switcher";
import { JoinHouseholdForm } from "@/components/dashboard/join-household-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function HouseholdOnboarding() {
  const t = useTranslations("Dashboard.onboarding");
  const dashboardT = useTranslations("Dashboard");
  const navigationT = useTranslations("Navigation");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  let modalTitle = t("modalTitle");
  let modalDescription = t("modalDescription");
  if (joining) {
    modalTitle = navigationT("join.title");
    modalDescription = navigationT("join.description");
  } else if (creating) {
    modalTitle = navigationT("setupTitle");
    modalDescription = navigationT("setupDescription");
  }
  const previewHousehold = t("previewHousehold");

  return (
    <>
      <div inert aria-hidden="true">
        <DashboardShell email="" username="Fridgy" avatarPath={null} householdName={previewHousehold} householdId="preview" households={[{ id: "preview", name: previewHousehold, isOwner: true }]}>
          <div className="space-y-5 pb-6">
            <section className="dashboard-hero relative isolate overflow-hidden bg-surface-strong p-6 text-surface-strong-foreground sm:p-8 xl:p-10">
              <div className="dashboard-hero-texture pointer-events-none absolute inset-0" aria-hidden="true" />
              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)] lg:items-center">
                <div className="max-w-xl">
                  <p className="text-sm font-bold text-surface-strong-accent">{dashboardT("householdEyebrow")}</p>
                  <h1 className="marketing-display mt-3 text-[clamp(2.7rem,4.5vw,5rem)] leading-[1.03] tracking-[-0.06em] text-balance">{t("welcomeTitle")}</h1>
                  <p className="mt-4 max-w-md leading-7 text-surface-strong-foreground/80">{t("welcomeDescription")}</p>
                </div>
                <OnboardingSteps hasHousehold={false} hasProducts={false} hasCooked={false} />
              </div>
            </section>
            <section aria-label={dashboardT("snapshotTitle")} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
              <div className="app-card min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">{dashboardT("expiringEyebrow")}</p>
                    <h2 className="mt-1 text-xl font-extrabold">{dashboardT("expiringTitle")}</h2>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">0</span>
                </div>
                <p className="px-5 py-5 text-sm text-muted-foreground sm:px-6">{dashboardT("expiringEmpty")}</p>
                <div className="flex min-h-12 items-center border-t border-border px-5 text-sm font-semibold text-primary sm:px-6">{dashboardT("viewAll")}</div>
              </div>
              <section className="app-card min-w-0 p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">{dashboardT("consumedEyebrow")}</p>
                <h2 className="mt-1 text-xl font-extrabold">{dashboardT("consumedTitle")}</h2>
                <p className="mt-4 text-sm text-muted-foreground">{dashboardT("consumedEmpty")}</p>
              </section>
            </section>
          </div>
        </DashboardShell>
      </div>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="gap-6 p-6 sm:max-w-md sm:p-8">
          <DialogHeader className="items-center text-center">
            <BrandIcon name="welcome_onboarding" className="mb-2 size-20" />
            <DialogTitle className="text-2xl font-extrabold tracking-tight">{modalTitle}</DialogTitle>
            <DialogDescription className="text-base leading-6">{modalDescription}</DialogDescription>
          </DialogHeader>
          {!creating ? <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1" role="group" aria-label={t("householdChoice")}>
            <Button type="button" variant={joining ? "ghost" : "secondary"} className="h-auto min-h-12 whitespace-normal px-3 py-2" aria-pressed={!joining} onClick={() => setJoining(false)}>
              <HomeIcon aria-hidden="true" /> {navigationT("createHousehold")}
            </Button>
            <Button type="button" variant={joining ? "secondary" : "ghost"} className="h-auto min-h-12 whitespace-normal px-3 py-2" aria-pressed={joining} onClick={() => setJoining(true)}>
              <UsersIcon aria-hidden="true" /> {navigationT("join.title")}
            </Button>
          </div> : null}
          <div className="space-y-4">
            {joining ? <JoinHouseholdForm /> : <HouseholdCreationForm onboarding onLoadingChange={setCreating} />}
            {!creating ? <Button nativeButton={false} render={<Link href="/" />} variant="ghost" className="h-11 w-full">
              <ArrowLeftIcon aria-hidden="true" /> {t("backHome")}
            </Button> : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
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
