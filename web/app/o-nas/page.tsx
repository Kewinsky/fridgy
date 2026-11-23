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
            src="/brand/about-household.jpg"
            alt={t("aboutPhotoAlt")}
            width={1672}
            height={941}
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1128px) 65vw, 700px"
            className="block h-full w-full object-cover"
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
