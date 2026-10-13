"use client";

import { MoonIcon, MonitorIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const themes = [
  { value: "light", label: "Jasny", icon: SunIcon },
  { value: "dark", label: "Ciemny", icon: MoonIcon },
  { value: "system", label: "Systemowy", icon: MonitorIcon },
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map(({ value, label, icon: Icon }) => (
        <Button key={value} type="button" variant={theme === value ? "secondary" : "outline"} className="h-11" onClick={() => setTheme(value)}>
          <Icon aria-hidden="true" /> {label}
        </Button>
      ))}
    </div>
  );
}
