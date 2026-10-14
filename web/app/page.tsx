import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  CameraIcon,
  ChefHatIcon,
  LeafIcon,
  PackageCheckIcon,
  ReceiptTextIcon,
  SparklesIcon,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Landing");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function HomePage() {
  const t = await getTranslations("Landing");
  const benefits = [
    {
      icon: ReceiptTextIcon,
      title: t("benefitReceiptTitle"),
      description: t("benefitReceiptDescription"),
    },
    {
      icon: LeafIcon,
      title: t("benefitDatesTitle"),
      description: t("benefitDatesDescription"),
    },
    {
      icon: ChefHatIcon,
      title: t("benefitCookingTitle"),
      description: t("benefitCookingDescription"),
    },
  ];

  return (
    <main className="min-h-dvh overflow-hidden">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LeafIcon className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl">Fridgy</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hidden h-11 px-4 sm:inline-flex",
            )}
          >
            {t("login")}
          </Link>
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {t("description")}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-12 rounded-lg px-6 text-base",
              )}
            >
              {t("start")}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
            <a
              href="#jak-to-dziala"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-lg px-6 text-base",
              )}
            >
              {t("howItWorks")}
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("loginHint")}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="subtle-grid absolute -inset-10 -z-10 rounded-[2.5rem] opacity-45 [mask-image:radial-gradient(black,transparent_70%)]" />
          <div className="app-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t("today")}
                </p>
                <p className="mt-1 font-extrabold">{t("yourHome")}</p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                KT
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <div className="rounded-xl bg-surface-strong p-5 text-surface-strong-foreground sm:p-6">
                <CameraIcon
                  className="size-7 text-surface-strong-accent"
                  aria-hidden="true"
                />
                <p className="mt-6 text-2xl font-extrabold">
                  {t("addReceipt")}
                </p>
                <p className="mt-2 text-sm leading-6 text-surface-strong-foreground/75">
                  {t("addReceiptDescription")}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                    <PackageCheckIcon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-2xl font-extrabold">24</p>
                  <p className="text-xs text-muted-foreground">{t("productsAtHome")}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-soon-soft text-soon">
                    <SparklesIcon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-2xl font-extrabold">4</p>
                  <p className="text-xs text-muted-foreground">{t("useSoon")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="jak-to-dziala"
        className="scroll-mt-8 border-y border-border bg-card/65"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
              {t("rhythm")}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("sectionTitle")}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="app-card p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-extrabold text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="rounded-2xl bg-surface-strong px-6 py-12 text-center text-surface-strong-foreground sm:px-10 sm:py-16">
          <LeafIcon
            className="mx-auto size-8 text-surface-strong-accent"
            aria-hidden="true"
          />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-surface-strong-foreground/70">
            {t("ctaDescription")}
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "mt-8 h-12 rounded-lg px-6 text-base",
            )}
          >
            {t("ctaButton")}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p className="font-bold text-foreground">Fridgy</p>
          <p>{t("footer")}</p>
        </div>
      </footer>
    </main>
  );
}
