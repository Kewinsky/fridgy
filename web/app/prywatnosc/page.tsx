import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/marketing/legal-document";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPages");
  return { title: t("privacyTitle"), description: t("privacyIntro") };
}

export default function PrivacyPage() {
  return <LegalDocument kind="privacy" />;
}
