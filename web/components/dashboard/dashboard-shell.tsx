"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  ChefHatIcon,
  BookOpenCheckIcon,
  HomeIcon,
  LeafIcon,
  ListChecksIcon,
  LogOutIcon,
  ReceiptTextIcon,
  SettingsIcon,
  ShoppingBasketIcon,
} from "lucide-react";

import { signOut } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  {
    href: "/dashboard",
    labelKey: "overview",
    shortLabelKey: "overviewShort",
    icon: HomeIcon,
  },
  {
    href: "/dashboard/zapasy",
    labelKey: "inventory",
    shortLabelKey: "inventoryShort",
    icon: ShoppingBasketIcon,
  },
  {
    href: "/dashboard/co-ugotowac",
    labelKey: "cook",
    shortLabelKey: "cookShort",
    icon: ChefHatIcon,
  },
  {
    href: "/dashboard/moje-przepisy",
    labelKey: "recipes",
    shortLabelKey: "recipesShort",
    icon: BookOpenCheckIcon,
  },
  {
    href: "/dashboard/lista-zakupow",
    labelKey: "shopping",
    shortLabelKey: "shoppingShort",
    icon: ListChecksIcon,
  },
  {
    href: "/dashboard/ustawienia",
    labelKey: "settings",
    shortLabelKey: "settingsShort",
    icon: SettingsIcon,
  },
] as const;

const mobileNavigation = [
  navigation[0],
  navigation[1],
  {
    href: "/dashboard/dodaj-paragon",
    labelKey: "receipt",
    shortLabelKey: "receiptShort",
    icon: ReceiptTextIcon,
  },
  navigation[2],
  navigation[4],
] as const;

export function DashboardShell({
  children,
  email,
}: {
  children: ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const initial = email.charAt(0).toUpperCase();

  if (pathname.startsWith("/dashboard/gotowanie/")) {
    return (
      <main className="min-h-dvh bg-background px-4 py-6 text-foreground sm:px-7 sm:py-10">
        {children}
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <Link href="/dashboard" className="flex h-20 items-center gap-3 px-7">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LeafIcon className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-extrabold">Fridgy</span>
        </Link>

        <div className="px-5">
          <Button
            nativeButton={false}
            render={
              <Link
                href="/dashboard/dodaj-paragon"
                aria-current={
                  pathname.startsWith("/dashboard/dodaj-paragon")
                    ? "page"
                    : undefined
                }
              />
            }
            className="h-11 w-full"
          >
            {t("receipt")}
          </Button>
        </div>

        <nav aria-label={t("mainNavigation")} className="mt-7 space-y-1 px-4">
          {navigation.map(({ href, labelKey, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border p-5">
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start px-2"
            >
              <LogOutIcon aria-hidden="true" />
              {t("signOut")}
            </Button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-7 lg:px-10">
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LeafIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="font-extrabold">Fridgy</span>
          </Link>
          <p className="hidden text-sm text-muted-foreground lg:block">
            {t("yourHome")}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/ustawienia"
              className="flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label={t("settings")}
            >
              <SettingsIcon className="size-5" aria-hidden="true" />
            </Link>
            <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
              {initial}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-7 lg:px-10 lg:py-9 lg:pb-12">
          {children}
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card px-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label={t("mobileNavigation")}
      >
        {mobileNavigation.map(({ href, shortLabelKey, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold text-muted-foreground",
                active && "text-primary",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="max-w-full truncate">{t(shortLabelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
