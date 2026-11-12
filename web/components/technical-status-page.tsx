"use client";

import { RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { StatusPage } from "@/components/status-page";
import { Button } from "@/components/ui/button";

export function TechnicalStatusPage({ status }: { status: "offline" | "maintenance" }) {
  const t = useTranslations("Technical");
  const router = useRouter();

  function retry() {
    if (status === "offline" && window.location.pathname === "/offline") {
      router.push("/");
      return;
    }
    window.location.reload();
  }

  return <StatusPage icon={status === "offline" ? "no_internet" : "maintenance"} label={t(`${status}.label`)}
    title={t(`${status}.title`)} description={t(`${status}.description`)}
    actions={<Button type="button" className="h-11" onClick={retry}>
      <RefreshCwIcon aria-hidden="true" /> {t("retry")}
    </Button>} />;
}
