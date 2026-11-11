import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MeasureDictionary } from "@/components/dashboard/measure-dictionary";
import { PageHeader } from "@/components/dashboard/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MeasureDictionary");
  return { title: t("title"), description: t("description") };
}

export default async function MeasureDictionaryPage() {
  const t = await getTranslations("MeasureDictionary");
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className="app-card p-4 sm:p-6"><MeasureDictionary /></div>
    </div>
  );
}
