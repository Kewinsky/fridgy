import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CookingPage } from "@/components/dashboard/cooking-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cooking");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function CookingRoute() {
  return <CookingPage />;
}
