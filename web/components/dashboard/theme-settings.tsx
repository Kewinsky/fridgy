"use client";

import { MoonIcon, MonitorIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const themes = [
  { value: "light", labelKey: "light", icon: SunIcon },
  { value: "dark", labelKey: "dark", icon: MoonIcon },
  { value: "system", labelKey: "system", icon: MonitorIcon },
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Theme");

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map(({ value, labelKey, icon: Icon }) => (
        <Button key={value} type="button" variant={theme === value ? "secondary" : "outline"} className="h-11" onClick={() => setTheme(value)}>
          <Icon aria-hidden="true" /> {t(labelKey)}
        </Button>
      ))}
    </div>
  );
}
