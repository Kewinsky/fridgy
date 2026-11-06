"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BanknoteIcon,
  DatabaseZapIcon,
  InfoIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { resetDemoData, saveProfileSetting, type ProfileSettings } from "@/app/dashboard/settings-actions";

import {
  FieldLabel,
  PreferenceCard,
  SettingsDropdown,
} from "@/components/dashboard/preference-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export function AdvancedSettings({ version, initialSettings }: { version: string; initialSettings: ProfileSettings }) {
  const t = useTranslations("Settings.advanced");
  const common = useTranslations("Common");
  const [settings, setSettings] = useState(initialSettings);

  async function save<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    try {
      await saveProfileSetting(key, value);
      setSettings((current) => ({ ...current, [key]: value }));
      toast.success(common("saved"));
    } catch { toast.error(common("saveFailed")); }
  }

  return (
    <>
      <PreferenceCard
        icon={BanknoteIcon}
        title={t("regional.title")}
        description={t("regional.description")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label={t("regional.currencyLabel")}>
            <SettingsDropdown
              ariaLabel={t("regional.currencyLabel")}
              value={settings.currency}
              onValueChange={(value) => void save("currency", value as ProfileSettings["currency"])}
              options={["PLN", "EUR", "GBP", "CHF"].map((value) => ({ value, label: value }))}
            />
          </FieldLabel>
          <FieldLabel label={t("regional.dateLabel")}>
            <SettingsDropdown
              ariaLabel={t("regional.dateLabel")}
              value={settings.date_format}
              onValueChange={(value) => void save("date_format", value as ProfileSettings["date_format"])}
              options={["DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((value) => ({ value, label: value }))}
            />
          </FieldLabel>
        </div>
      </PreferenceCard>

      <PreferenceCard
        icon={ShieldCheckIcon}
        title={t("privacy.title")}
        description={t("privacy.description")}
      >
        <div className="grid gap-2">
          {(["personalization", "analytics"] as const).map((option) => (
            <label
              key={option}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-input px-3 py-3"
            >
              <Checkbox checked={option === "personalization" ? settings.personalization_consent : settings.analytics_consent}
                onCheckedChange={(checked) => void save(option === "personalization" ? "personalization_consent" : "analytics_consent", checked === true)} className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">{t(`privacy.options.${option}.title`)}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {t(`privacy.options.${option}.description`)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </PreferenceCard>

      <PreferenceCard icon={DatabaseZapIcon} title={t("demo.title")} description={t("demo.description")}>
        <ResetDemoDialog />
      </PreferenceCard>

      <PreferenceCard icon={InfoIcon} title={t("about.title")} description={t("about.description")}>
        <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-input px-3">
          <div>
            <p className="text-sm font-semibold">Fridgy Web</p>
            <p className="text-xs text-muted-foreground">{t("about.version")}</p>
          </div>
          <Badge variant="outline">v{version}</Badge>
        </div>
      </PreferenceCard>
    </>
  );
}

function ResetDemoDialog() {
  const t = useTranslations("Settings.advanced.demo.dialog");
  const common = useTranslations("Common");

  async function reset() {
    try { await resetDemoData(); window.location.reload(); }
    catch { toast.error(common("saveFailed")); }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-11" />}>
        <RotateCcwIcon aria-hidden="true" /> {t("open")}
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
            <RotateCcwIcon aria-hidden="true" /> {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
