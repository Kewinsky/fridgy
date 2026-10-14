"use client";

import { useState } from "react";
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

export function PreferenceSettings() {
  const t = useTranslations("Settings.preferences");

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
                <Checkbox defaultChecked />
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
                defaultValue="none"
                options={(["none", "vegetarian", "vegan", "pescatarian"] as const).map(
                  (value) => ({ value, label: t(`diet.options.${value}`) }),
                )}
              />
            </FieldLabel>
            <FieldLabel label={t("diet.allergiesLabel")}>
              <Input aria-label={t("diet.allergiesLabel")} className="h-11" placeholder={t("diet.allergiesPlaceholder")} />
            </FieldLabel>
            <FieldLabel label={t("diet.excludedLabel")}>
              <Input aria-label={t("diet.excludedLabel")} className="h-11" placeholder={t("diet.excludedPlaceholder")} />
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
              defaultValue="ask"
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
              defaultValue="review"
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
  options,
}: {
  ariaLabel: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  const [value, setValue] = useState(defaultValue);
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
          <DropdownMenuItem key={option.value} onClick={() => setValue(option.value)}>
            <span className="flex-1">{option.label}</span>
            {value === option.value ? <CheckIcon aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
