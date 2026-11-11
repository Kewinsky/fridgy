"use client";

import { RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { BrandIcon } from "@/components/brand-icon";
import { Button } from "@/components/ui/button";

export function TechnicalStatusPage({ status }: { status: "offline" | "maintenance" }) {
  const t = useTranslations("Technical");
  const router = useRouter();

  function retry() {
    if (status === "offline" && window.location.pathname === "/offline") {
      router.push("/");
      return;
    }
    window.location.reload();
  }

  return (
    <main className="relative grid min-h-dvh place-items-center bg-background px-4 py-16 text-foreground">
      <div className="subtle-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(black,transparent_70%)]" aria-hidden="true" />
      <section className="app-card relative w-full max-w-lg p-7 text-center sm:p-10" aria-live="polite">
        <BrandIcon name={status === "offline" ? "no_internet" : "maintenance"} className="mx-auto size-32" />
        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-primary">{t(`${status}.label`)}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t(`${status}.title`)}</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{t(`${status}.description`)}</p>
        <Button type="button" className="mt-8 h-11" onClick={retry}>
          <RefreshCwIcon aria-hidden="true" /> {t("retry")}
        </Button>
      </section>
    </main>
  );
}
