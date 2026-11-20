import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
    <InfoPage
      eyebrow={t("aboutEyebrow")}
      title={t("aboutTitle")}
      intro={t("aboutIntro")}
    >
      <div className="marketing-about-grid">
        <div className="marketing-about-photo">
          <Image
            src="/recipes/szakszuka-z-ciecierzyca.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 90vw, 460px"
            className="object-cover"
          />
        </div>
        <div className="marketing-about-copy">
          <p>{t("aboutBody")}</p>
          <Link href="/#jak-to-dziala" className="marketing-button">
            {m("howItWorks")}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </InfoPage>
  );
}
