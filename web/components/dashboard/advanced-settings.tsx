"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { resetDemoData, saveProfileSetting, type ProfileSettings } from "@/app/dashboard/settings-actions";

import { PreferenceCard, SettingsDropdown } from "@/components/dashboard/preference-settings";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AdvancedSettings({ version, initialSettings, isHouseholdOwner }: { version: string; initialSettings: ProfileSettings; isHouseholdOwner: boolean }) {
  const t = useTranslations("Settings.advanced");
  const common = useTranslations("Common");
  const router = useRouter();
  const { setDateFormat } = useDashboardData();
  const [settings, setSettings] = useState(initialSettings);

  async function save<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    try {
      await saveProfileSetting(key, value);
      setSettings((current) => ({ ...current, [key]: value }));
      if (key === "date_format") {
        setDateFormat(value as ProfileSettings["date_format"]);
        router.refresh();
      }
      toast.success(common("saved"));
    } catch { toast.error(common("saveFailed")); }
  }

  return (
    <>
      <PreferenceCard title={t("regional.dateLabel")} description={t("regional.description")}>
        <SettingsDropdown
          ariaLabel={t("regional.dateLabel")}
          value={settings.date_format}
          onValueChange={(value) => void save("date_format", value as ProfileSettings["date_format"])}
          options={["DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((value) => ({ value, label: value }))}
        />
      </PreferenceCard>

      {isHouseholdOwner ? (
        <PreferenceCard title={t("demo.title")} description={t("demo.description")}>
          <div className="flex justify-end"><ResetDemoDialog /></div>
        </PreferenceCard>
      ) : null}

      <PreferenceCard title={t("about.title")} description={t("about.description")}>
        <div className="flex min-h-11 items-center justify-end">
          <Badge variant="outline">v{version}</Badge>
        </div>
      </PreferenceCard>
    </>
  );
}

function ResetDemoDialog() {
  const t = useTranslations("Settings.advanced.demo.dialog");
  const common = useTranslations("Common");
  const { householdId } = useDashboardData();

  async function reset() {
    try { await resetDemoData(householdId); window.location.reload(); }
    catch { toast.error(common("saveFailed")); }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-11" />}>
        <Trash2Icon aria-hidden="true" /> {t("open")}
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" className="h-11" />}>
            {t("cancel")}
          </DialogClose>
          <Button type="button" variant="destructive" className="h-11" onClick={reset}>
            <Trash2Icon aria-hidden="true" /> {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
