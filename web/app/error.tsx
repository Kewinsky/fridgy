"use client";

import Link from "next/link";
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors.page");
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-16 text-foreground">
      <section className="app-card w-full max-w-lg p-6 text-center sm:p-8">
        <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-wider text-destructive">{t("label")}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{t("title")}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {t("description")}
        </p>
        {error.digest ? <p className="mt-2 text-xs text-muted-foreground">{t("code", { code: error.digest })}</p> : null}
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button className="h-11" onClick={reset}><RefreshCwIcon aria-hidden="true" /> {t("retry")}</Button>
          <Button nativeButton={false} render={<Link href="/" />} variant="outline" className="h-11"><HomeIcon aria-hidden="true" /> {t("home")}</Button>
        </div>
      </section>
    </main>
  );
}
