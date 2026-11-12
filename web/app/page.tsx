import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingContent } from "@/components/marketing/landing-content";
import { PublicShell } from "@/components/marketing/public-shell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Landing");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function HomePage() {
  return <PublicShell><LandingContent /></PublicShell>;
}
