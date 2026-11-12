import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, MailIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InfoPage } from "@/components/marketing/info-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPages");
  return { title: t("contactTitle"), description: t("contactIntro"), robots: { index: false } };
}

export default async function ContactPage() {
  const t = await getTranslations("PublicPages");
  return (
    <InfoPage eyebrow={t("contactEyebrow")} title={t("contactTitle")} intro={t("contactIntro")}>
      <div className="marketing-info-card max-w-2xl">
        <span className="marketing-step-icon"><MailIcon className="size-7" aria-hidden="true" /></span>
        <h2 className="marketing-display mt-6 text-3xl">{t("contactPending")}</h2>
        <p className="mt-3 leading-7 text-[#5b6b5e]">{t("contactPendingText")}</p>
        <Link href="/faq" className="marketing-button marketing-button-outline mt-7">{t("contactFaq")}<ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
      </div>
    </InfoPage>
  );
}
