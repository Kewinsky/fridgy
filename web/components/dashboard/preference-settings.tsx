"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { savePreferenceSettings, type PreferenceSettingsValues, type ProfileSettings } from "@/app/dashboard/settings-actions";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { recipeAllergens } from "@/lib/demo-recipes";
import { parseSelectedAllergens } from "@/lib/recipe-preferences";

const notificationOptions = [
  { key: "sameDay", day: 0 },
  { key: "oneDay", day: 1 },
  { key: "threeDays", day: 3 },
] as const;

function getPreferences(settings: ProfileSettings): PreferenceSettingsValues {
  return {
    notification_days: [...settings.notification_days].sort((a, b) => a - b),
    diet: settings.diet,
    allergies: parseSelectedAllergens(settings.allergies).join(","),
    excluded_ingredients: settings.excluded_ingredients,
    deduction_mode: settings.deduction_mode,
    receipt_mode: settings.receipt_mode,
  };
}

export function PreferenceSettings({ initialSettings }: { initialSettings: ProfileSettings }) {
  const t = useTranslations("Settings.preferences");
  const allergenT = useTranslations("Recipe.allergens.options");
  const common = useTranslations("Common");
  const [settings, setSettings] = useState(() => getPreferences(initialSettings));
  const [savedSettings, setSavedSettings] = useState(() => getPreferences(initialSettings));
  const [isPending, startTransition] = useTransition();
  const { setDeductionMode, setDietPreferences } = useDashboardData();
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const selectedAllergens = parseSelectedAllergens(settings.allergies);

  function save() {
    if (!hasChanges || isPending) return;
    const values = settings;
    startTransition(async () => {
      try {
        await savePreferenceSettings(values);
        setSavedSettings(values);
        setDeductionMode(values.deduction_mode);
        setDietPreferences({ diet: values.diet, allergies: values.allergies, excludedIngredients: values.excluded_ingredients });
        toast.success(common("saved"));
      } catch {
        toast.error(common("saveFailed"));
      }
    });
  }

  return (
    <div>
      <div className="space-y-5">
        <PreferenceCard
          title={t("expiry.title")}
          description={t("expiry.description")}
        >
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="outline" className="h-11 w-fit max-w-full px-3 font-normal" aria-label={t("expiry.title")}>
                    <span className="truncate">
                      {notificationOptions.filter(({ day }) => settings.notification_days.includes(day)).map(({ key }) => t(`expiry.options.${key}`)).join(", ") || t("expiry.none")}
                    </span>
                    <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-(--anchor-width)">
                {notificationOptions.map(({ key, day }) => (
                  <DropdownMenuCheckboxItem
                    key={day}
                    checked={settings.notification_days.includes(day)}
                    closeOnClick={false}
                    onCheckedChange={(checked) => setSettings((current) => ({
                      ...current,
                      notification_days: checked
                        ? [...new Set([...current.notification_days, day])].sort((a, b) => a - b)
                        : current.notification_days.filter((value) => value !== day),
                    }))}
                  >
                    {t(`expiry.options.${key}`)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PreferenceCard>

        <PreferenceCard
          title={t("diet.typeLabel")}
          description={t("diet.description")}
        >
          <SettingsDropdown
            ariaLabel={t("diet.typeLabel")}
            value={settings.diet}
            onValueChange={(value) => setSettings((current) => ({ ...current, diet: value as PreferenceSettingsValues["diet"] }))}
            options={(["none", "vegetarian", "vegan", "pescatarian"] as const).map(
              (value) => ({ value, label: t(`diet.options.${value}`) }),
            )}
          />
        </PreferenceCard>
        <PreferenceCard title={t("diet.allergiesLabel")}>
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button type="button" variant="outline" className="h-11 min-w-56 max-w-full justify-between px-3 font-normal" aria-label={t("diet.allergiesLabel")}>
                  <span className="truncate">{selectedAllergens.length ? selectedAllergens.map((allergen) => allergenT(allergen)).join(", ") : t("diet.allergiesPlaceholder")}</span>
                  <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="max-h-80 min-w-(--anchor-width) overflow-y-auto">
                {recipeAllergens.map((allergen) => (
                  <DropdownMenuCheckboxItem
                    key={allergen}
                    checked={selectedAllergens.includes(allergen)}
                    closeOnClick={false}
                    onCheckedChange={(checked) => setSettings((current) => {
                      const selected = parseSelectedAllergens(current.allergies);
                      return { ...current, allergies: recipeAllergens.filter((item) =>
                        item === allergen ? checked : selected.includes(item),
                      ).join(",") };
                    })}
                  >
                    {allergenT(allergen)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PreferenceCard>
        <PreferenceCard title={t("diet.excludedLabel")}>
          <Input aria-label={t("diet.excludedLabel")} className="h-11" placeholder={t("diet.excludedPlaceholder")}
            value={settings.excluded_ingredients} onChange={(event) => setSettings((current) => ({ ...current, excluded_ingredients: event.target.value }))}
          />
        </PreferenceCard>

        <PreferenceCard
          title={t("deduction.title")}
          description={t("deduction.description")}
        >
          <SettingsDropdown
            ariaLabel={t("deduction.label")}
            value={settings.deduction_mode}
            onValueChange={(value) => setSettings((current) => ({ ...current, deduction_mode: value as PreferenceSettingsValues["deduction_mode"] }))}
            options={(["always", "never", "ask"] as const).map((value) => ({
              value,
              label: t(`deduction.options.${value}`),
            }))}
          />
        </PreferenceCard>

        <PreferenceCard
          title={t("receipt.title")}
          description={t("receipt.description")}
        >
          <SettingsDropdown
            ariaLabel={t("receipt.label")}
            value={settings.receipt_mode}
            onValueChange={(value) => setSettings((current) => ({ ...current, receipt_mode: value as PreferenceSettingsValues["receipt_mode"] }))}
            options={(["automatic", "review"] as const).map((value) => ({
              value,
              label: t(`receipt.options.${value}`),
            }))}
          />
        </PreferenceCard>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" className="h-11" disabled={!hasChanges || isPending} onClick={() => setSettings(savedSettings)}>{t("cancel")}</Button>
        <Button type="button" className="h-11" disabled={!hasChanges || isPending} aria-busy={isPending} onClick={save}>{isPending ? common("saving") : t("save")}</Button>
      </div>
    </div>
  );
}

export function PreferenceCard({
  title,
  description,
  className = "",
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`app-card grid items-center gap-5 p-5 md:grid-cols-2 ${className}`}>
      <div className="min-w-0">
        <h3 className="text-sm font-medium">{title}</h3>
        {description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
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
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-11 w-fit max-w-full justify-between px-3 font-normal"
              aria-label={ariaLabel}
            >
              <span className="truncate">{selectedLabel}</span>
              <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-(--anchor-width)">
          {options.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onValueChange ? onValueChange(option.value) : setValue(option.value)}>
              <span className="flex-1">{option.label}</span>
              {value === option.value ? <CheckIcon aria-hidden="true" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
