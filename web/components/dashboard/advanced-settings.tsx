"use client";

import {
  BanknoteIcon,
  DatabaseZapIcon,
  InfoIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  UtensilsIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

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

const cuisineKeys = [
  "polish",
  "italian",
  "asian",
  "mexican",
  "mediterranean",
  "middleEastern",
] as const;

export function AdvancedSettings({ version }: { version: string }) {
  const t = useTranslations("Settings.advanced");
  const recipeT = useTranslations("Recipe.cuisineOptions");

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-2">
        <PreferenceCard
          icon={BanknoteIcon}
          title={t("regional.title")}
          description={t("regional.description")}
          className="lg:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldLabel label={t("regional.currencyLabel")}>
              <SettingsDropdown
                ariaLabel={t("regional.currencyLabel")}
                defaultValue="PLN"
                options={["PLN", "EUR", "GBP", "CHF"].map((value) => ({ value, label: value }))}
              />
            </FieldLabel>
            <FieldLabel label={t("regional.dateLabel")}>
              <SettingsDropdown
                ariaLabel={t("regional.dateLabel")}
                defaultValue="DD.MM.YYYY"
                options={["DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((value) => ({ value, label: value }))}
              />
            </FieldLabel>
          </div>
        </PreferenceCard>

        <PreferenceCard
          icon={UtensilsIcon}
          title={t("cuisines.title")}
          description={t("cuisines.description")}
          className="lg:col-span-2"
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {cuisineKeys.map((cuisine, index) => (
              <label
                key={cuisine}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 py-2 text-sm font-medium"
              >
                <Checkbox defaultChecked={index < 3} />
                {recipeT(cuisine)}
              </label>
            ))}
          </div>
        </PreferenceCard>

        <PreferenceCard
          icon={ShieldCheckIcon}
          title={t("privacy.title")}
          description={t("privacy.description")}
          className="lg:col-span-2"
        >
          <div className="grid gap-2">
            {(["personalization", "analytics"] as const).map((option) => (
              <label
                key={option}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-input px-3 py-3"
              >
                <Checkbox defaultChecked={option === "personalization"} className="mt-0.5" />
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
      </div>
    </div>
  );
}

function ResetDemoDialog() {
  const t = useTranslations("Settings.advanced.demo.dialog");

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
          <DialogClose render={<Button type="button" variant="destructive" className="h-11" />}>
            <RotateCcwIcon aria-hidden="true" /> {t("confirm")}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
