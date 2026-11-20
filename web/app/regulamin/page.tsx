import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/marketing/legal-document";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPages");
  return { title: t("termsTitle"), description: t("termsIntro") };
}

export default function TermsPage() {
  return <LegalDocument kind="terms" />;
}
