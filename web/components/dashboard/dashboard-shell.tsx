"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  ChefHatIcon,
  BookOpenCheckIcon,
  ChevronDownIcon,
  CirclePlusIcon,
  HomeIcon,
  LeafIcon,
  ListChecksIcon,
  LogOutIcon,
  PackagePlusIcon,
  SettingsIcon,
  ShoppingBasketIcon,
} from "lucide-react";

import { signOut } from "@/app/dashboard/actions";
import { HouseholdSwitcher } from "@/components/dashboard/household-switcher";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getProfileImageSrc } from "@/lib/profile-image";
import type { HouseholdOption } from "@/lib/dashboard-data";

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
] as const;

const mobileNavigation = [
  navigation[0],
  navigation[1],
  {
    href: "/dashboard/dodaj-produkty",
    labelKey: "receipt",
    shortLabelKey: "receiptShort",
    icon: PackagePlusIcon,
  },
  navigation[2],
  navigation[4],
] as const;

export function DashboardShell({
  children,
  email,
  username,
  avatarPath,
  householdName,
  householdId,
  households,
}: {
  children: ReactNode;
  email: string;
  username: string;
  avatarPath: string | null;
  householdName: string;
  householdId: string;
  households: HouseholdOption[];
}) {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const initial = username.charAt(0).toUpperCase();
  const avatarSrc = getProfileImageSrc(avatarPath);

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

        <div className="mb-5 px-5">
          <HouseholdSwitcher currentId={householdId} households={households} />
        </div>

        <div className="px-5">
          <Button
            nativeButton={false}
            render={
              <Link
                href="/dashboard/dodaj-produkty"
                aria-current={
                  pathname.startsWith("/dashboard/dodaj-produkty")
                    ? "page"
                    : undefined
                }
              />
            }
            className="h-11 w-full"
          >
            <CirclePlusIcon aria-hidden="true" />
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

        <div className="mt-auto border-t border-border p-4">
          <ProfileMenu email={email} username={username} avatarSrc={avatarSrc} initial={initial} householdName={householdName} />
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-7 lg:px-10 lg:py-9 lg:pb-12">
          <div className="mb-5 max-w-sm lg:hidden">
            <HouseholdSwitcher currentId={householdId} households={households} />
          </div>
          {children}
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border bg-card px-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
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
        <ProfileMenu email={email} username={username} avatarSrc={avatarSrc} initial={initial} householdName={householdName} mobile />
      </nav>
    </main>
  );
}

function ProfileMenu({
  email,
  username,
  avatarSrc,
  initial,
  householdName,
  mobile = false,
}: {
  email: string;
  username: string;
  avatarSrc: string | null;
  initial: string;
  householdName: string;
  mobile?: boolean;
}) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const active = pathname.startsWith("/dashboard/ustawienia");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            aria-label={t("account")}
            className={mobile
              ? cn("flex min-h-16 w-full flex-col gap-1 rounded-none px-1 text-[10px] font-semibold", active && "text-primary")
              : "h-auto min-h-12 w-full justify-start gap-3 px-2 text-left"}
          >
            <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-bold text-primary", mobile ? "size-6" : "size-9 text-xs")}>
              {avatarSrc ? <Image src={avatarSrc} alt="" fill sizes={mobile ? "24px" : "36px"} className="object-cover" unoptimized /> : initial}
            </span>
            {mobile ? <span className="max-w-full truncate">{t("account")}</span> : <span className="min-w-0 flex-1 truncate text-sm font-semibold">{username}</span>}
            {mobile ? null : <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
          </Button>
        }
      />
      <DropdownMenuContent side="top" align={mobile ? "end" : "start"} sideOffset={8} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2">
            <span className="block truncate font-semibold text-foreground">{username}</span>
            <span className="block truncate font-normal">{email}</span>
            <span className="block truncate font-normal">{householdName}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/ustawienia" />}>
          <SettingsIcon aria-hidden="true" /> {t("settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem render={<button type="submit" className="w-full" />}>
            <LogOutIcon aria-hidden="true" /> {t("signOut")}
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
