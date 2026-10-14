import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, LeafIcon, ScanLineIcon, SparklesIcon } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { safeAuthPath } from "@/lib/auth-next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Login");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export const instant = false;

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const t = await getTranslations("Login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const params = await searchParams;
  const nextPath = safeAuthPath(params.next);

  if (data?.claims) {
    redirect(nextPath);
  }

  const initialError = params.error
    ? t("errors.oauth")
    : undefined;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-surface-strong p-10 text-surface-strong-foreground lg:flex lg:flex-col">
        <div className="strong-grid absolute inset-0" />
        <Link href="/" className="relative flex items-center gap-2.5 font-extrabold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-surface-strong-foreground text-surface-strong">
            <LeafIcon className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl">Fridgy</span>
        </Link>

        <div className="relative my-auto max-w-lg py-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-surface-strong-accent">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-5xl font-extrabold leading-tight tracking-[-0.045em]">
            {t("sideTitle")}
          </h2>
          <div className="mt-10 space-y-4 text-surface-strong-foreground/75">
            <p className="flex items-center gap-3">
              <ScanLineIcon
                className="size-5 text-surface-strong-accent"
                aria-hidden="true"
              />
              {t("receiptBenefit")}
            </p>
            <p className="flex items-center gap-3">
              <SparklesIcon
                className="size-5 text-surface-strong-accent"
                aria-hidden="true"
              />
              {t("ideasBenefit")}
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh flex-col p-5 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            {t("home")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
        </div>

        <div className="my-auto w-full py-12">
          <div className="app-card mx-auto max-w-md p-6 sm:p-8">
            <LoginForm initialError={initialError} nextPath={nextPath} />
          </div>
        </div>
      </section>
    </main>
  );
}
