import { getTranslations } from "next-intl/server";

import { StatusPage } from "@/components/status-page";

export default async function NotFound() {
  const t = await getTranslations("Errors.notFound");
  return <StatusPage icon="no_results" label={t("label")} title={t("title")} description={t("description")} actions={null} />;
}
