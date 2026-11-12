import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandIcon, BrandWordmark } from "@/components/brand-icon";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function PublicShell({ children, showStart = true }: { children: ReactNode; showStart?: boolean }) {
  const t = await getTranslations("Marketing");
  return (
    <div className="marketing min-h-dvh">
      <header className="marketing-header">
        <div className="marketing-container flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-1" aria-label="Fridgy">
            <BrandIcon name="logo" className="size-11" />
            <BrandWordmark className="text-[1.65rem]" />
          </Link>
          <nav aria-label={t("mainNav")} className="hidden items-center gap-8 md:flex">
            <Link href="/#jak-to-dziala" className="marketing-nav-link">{t("howItWorks")}</Link>
            <Link href="/#mozliwosci" className="marketing-nav-link">{t("features")}</Link>
            <Link href="/#cennik" className="marketing-nav-link">{t("pricing")}</Link>
            <Link href="/faq" className="marketing-nav-link">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            {showStart ? (
              <Link href="/login" className="marketing-button marketing-button-small">
                {t("start")}<ArrowUpRightIcon className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="marketing-footer">
        <div className="marketing-container grid gap-10 py-12 md:grid-cols-[1fr_auto] md:py-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-1" aria-label="Fridgy">
              <BrandIcon name="logo" className="size-11" />
              <BrandWordmark className="text-2xl" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#667469]">{t("footerText")}</p>
          </div>
          <nav aria-label={t("footerNav")} className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm font-medium sm:grid-cols-3">
            <Link href="/#jak-to-dziala">{t("howItWorks")}</Link>
            <Link href="/#cennik">{t("pricing")}</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/kontakt">{t("contact")}</Link>
            <Link href="/o-nas">{t("about")}</Link>
            <Link href="/prywatnosc">{t("privacy")}</Link>
            <Link href="/regulamin">{t("terms")}</Link>
          </nav>
        </div>
        <div className="marketing-container flex flex-col gap-2 border-t border-[#d8ded2] py-5 text-xs text-[#667469] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Fridgy</span><span>{t("footerNote")}</span>
        </div>
      </footer>
    </div>
  );
}
