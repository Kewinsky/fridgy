"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BellRingIcon,
  CheckIcon,
  ChevronDownIcon,
  CookingPotIcon,
  ReceiptTextIcon,
  SaladIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { saveProfileSetting, type ProfileSettings } from "@/app/dashboard/settings-actions";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";

export function PreferenceSettings({ initialSettings }: { initialSettings: ProfileSettings }) {
  const t = useTranslations("Settings.preferences");
  const common = useTranslations("Common");
  const [settings, setSettings] = useState(initialSettings);
  const { setDeductionMode } = useDashboardData();

  async function save<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    try {
      await saveProfileSetting(key, value);
      setSettings((current) => ({ ...current, [key]: value }));
      if (key === "deduction_mode") setDeductionMode(value as ProfileSettings["deduction_mode"]);
      toast.success(common("saved"));
    } catch { toast.error(common("saveFailed")); }
  }

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-2">
        <PreferenceCard
          icon={BellRingIcon}
          title={t("expiry.title")}
          description={t("expiry.description")}
        >
          <div className="grid gap-2">
            {(["sameDay", "oneDay", "threeDays"] as const).map((option) => (
              <label
                key={option}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-input px-3 py-2 text-sm font-medium"
              >
                <Checkbox checked={settings.notification_days.includes(({ sameDay: 0, oneDay: 1, threeDays: 3 } as const)[option])}
                  onCheckedChange={(checked) => {
                    const day = ({ sameDay: 0, oneDay: 1, threeDays: 3 } as const)[option];
                    void save("notification_days", checked ? [...settings.notification_days, day] : settings.notification_days.filter((value) => value !== day));
                  }} />
                {t(`expiry.options.${option}`)}
              </label>
            ))}
          </div>
        </PreferenceCard>

        <PreferenceCard
          icon={SaladIcon}
          title={t("diet.title")}
          description={t("diet.description")}
        >
          <div className="grid gap-4">
            <FieldLabel label={t("diet.typeLabel")}>
              <SettingsDropdown
                ariaLabel={t("diet.typeLabel")}
                value={settings.diet}
                onValueChange={(value) => void save("diet", value as ProfileSettings["diet"])}
                options={(["none", "vegetarian", "vegan", "pescatarian"] as const).map(
                  (value) => ({ value, label: t(`diet.options.${value}`) }),
                )}
              />
            </FieldLabel>
            <FieldLabel label={t("diet.allergiesLabel")}>
              <Input aria-label={t("diet.allergiesLabel")} className="h-11" placeholder={t("diet.allergiesPlaceholder")}
                value={settings.allergies} onChange={(event) => setSettings((current) => ({ ...current, allergies: event.target.value }))}
                onBlur={() => void save("allergies", settings.allergies)} />
            </FieldLabel>
            <FieldLabel label={t("diet.excludedLabel")}>
              <Input aria-label={t("diet.excludedLabel")} className="h-11" placeholder={t("diet.excludedPlaceholder")}
                value={settings.excluded_ingredients} onChange={(event) => setSettings((current) => ({ ...current, excluded_ingredients: event.target.value }))}
                onBlur={() => void save("excluded_ingredients", settings.excluded_ingredients)} />
            </FieldLabel>
          </div>
        </PreferenceCard>

        <PreferenceCard
          icon={CookingPotIcon}
          title={t("deduction.title")}
          description={t("deduction.description")}
        >
          <FieldLabel label={t("deduction.label")}>
            <SettingsDropdown
              ariaLabel={t("deduction.label")}
              value={settings.deduction_mode}
              onValueChange={(value) => void save("deduction_mode", value as ProfileSettings["deduction_mode"])}
              options={(["always", "never", "ask"] as const).map((value) => ({
                value,
                label: t(`deduction.options.${value}`),
              }))}
            />
          </FieldLabel>
        </PreferenceCard>

        <PreferenceCard
          icon={ReceiptTextIcon}
          title={t("receipt.title")}
          description={t("receipt.description")}
        >
          <FieldLabel label={t("receipt.label")}>
            <SettingsDropdown
              ariaLabel={t("receipt.label")}
              value={settings.receipt_mode}
              onValueChange={(value) => void save("receipt_mode", value as ProfileSettings["receipt_mode"])}
              options={(["automatic", "review"] as const).map((value) => ({
                value,
                label: t(`receipt.options.${value}`),
              }))}
            />
          </FieldLabel>
        </PreferenceCard>
      </div>
    </div>
  );
}

export function PreferenceCard({
  icon: Icon,
  title,
  description,
  className = "",
  children,
}: {
  icon: typeof BellRingIcon;
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`app-card p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

export function SettingsDropdown({
  ariaLabel,
  defaultValue,
  value: controlledValue,
  onValueChange,
  options,
}: {
  ariaLabel: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const [localValue, setValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const value = controlledValue ?? localValue;
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-between px-3 font-normal"
            aria-label={ariaLabel}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onValueChange ? onValueChange(option.value) : setValue(option.value)}>
            <span className="flex-1">{option.label}</span>
            {value === option.value ? <CheckIcon aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
