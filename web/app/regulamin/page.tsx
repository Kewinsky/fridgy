import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { InfoPage } from "@/components/marketing/info-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPages");
  return { title: t("termsTitle"), description: t("termsIntro"), robots: { index: false } };
}

export default async function TermsPage() {
  const t = await getTranslations("PublicPages");
  return (
    <InfoPage eyebrow={t("termsEyebrow")} title={t("termsTitle")} intro={t("termsIntro")}>
      <div className="marketing-info-card marketing-prose max-w-3xl">
        <h2 className="!mt-0">{t("termsPendingTitle")}</h2>
        <p>{t("termsPendingText")}</p>
      </div>
    </InfoPage>
  );
}
