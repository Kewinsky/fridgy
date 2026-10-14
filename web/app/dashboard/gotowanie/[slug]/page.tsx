import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CookingModePage } from "@/components/dashboard/cooking-mode-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CookingMode");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function CookingModeRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CookingModePage slug={slug} />;
}
