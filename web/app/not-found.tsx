import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/status-page";

export default async function NotFound() {
  const t = await getTranslations("Errors.notFound");
  return <StatusPage icon="no_results" label={t("label")} title={t("title")} description={t("description")}
    actions={<Button nativeButton={false} render={<Link href="/" />} className="h-11 px-4">
      <HomeIcon aria-hidden="true" /> {t("action")}
    </Button>} />;
}
