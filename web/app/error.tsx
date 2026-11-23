"use client";

import { RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/status-page";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors.page");
  return <StatusPage icon="error" tone="destructive" label={t("label")} title={t("title")} description={t("description")}
    detail={error.digest ? t("code", { code: error.digest }) : undefined}
    actions={<Button className="h-11" onClick={reset}><RefreshCwIcon aria-hidden="true" /> {t("retry")}</Button>} />;
}
