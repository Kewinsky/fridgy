import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { InfoPage } from "@/components/marketing/info-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPages");
  return { title: t("privacyTitle"), description: t("privacyIntro"), robots: { index: false } };
}

export default async function PrivacyPage() {
  const t = await getTranslations("PublicPages");
  return (
    <InfoPage eyebrow={t("privacyEyebrow")} title={t("privacyTitle")} intro={t("privacyIntro")}>
      <div className="marketing-info-card marketing-prose max-w-3xl">
        <h2 className="!mt-0">{t("privacyPendingTitle")}</h2>
        <p>{t("privacyPendingText")}</p>
      </div>
    </InfoPage>
  );
}
