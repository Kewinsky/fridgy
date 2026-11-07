"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { SettingsDropdown } from "@/components/dashboard/preference-settings";

const themes = ["light", "dark", "system"] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Theme");
  const settingsT = useTranslations("Settings");

  return (
    <SettingsDropdown
      ariaLabel={settingsT("theme")}
      value={theme ?? "system"}
      onValueChange={setTheme}
      options={themes.map((value) => ({ value, label: t(value) }))}
    />
  );
}
