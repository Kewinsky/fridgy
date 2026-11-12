import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InfoPage } from "@/components/marketing/info-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPages");
  return { title: t("aboutTitle"), description: t("aboutIntro") };
}

export default async function AboutPage() {
  const t = await getTranslations("PublicPages");
  const m = await getTranslations("Marketing");
  return (
    <InfoPage eyebrow={t("aboutEyebrow")} title={t("aboutTitle")} intro={t("aboutIntro")}>
      <div className="marketing-info-card max-w-3xl">
        <p className="marketing-display text-2xl leading-relaxed text-[#355441] sm:text-3xl">{t("aboutBody")}</p>
        <Link href="/#jak-to-dziala" className="marketing-button mt-8">{m("howItWorks")}<ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
      </div>
    </InfoPage>
  );
}
