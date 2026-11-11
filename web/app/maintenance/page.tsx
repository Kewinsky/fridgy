import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TechnicalStatusPage } from "@/components/technical-status-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Technical.maintenance");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default function MaintenancePage() {
  return <TechnicalStatusPage status="maintenance" />;
}
