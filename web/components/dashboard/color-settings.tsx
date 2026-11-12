"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const palettes = [
  { value: "green", color: "#77b783" },
  { value: "blue", color: "#83bce8" },
  { value: "violet", color: "#bb8dc8" },
] as const;

type Palette = (typeof palettes)[number]["value"];

function currentPalette(): Palette {
  const value = document.documentElement.getAttribute("data-palette");
  return value === "blue" || value === "violet" ? value : "green";
}

function subscribe(callback: () => void) {
  window.addEventListener("fridgy-palette-change", callback);
  return () => window.removeEventListener("fridgy-palette-change", callback);
}

export function ColorSettings() {
  const t = useTranslations("Settings.palette");
  const selected = useSyncExternalStore(subscribe, currentPalette, () => "green");

  function choose(value: Palette) {
    document.documentElement.setAttribute("data-palette", value);
    try {
      window.localStorage.setItem("fridgy-palette", value);
    } catch {
      // The selected palette remains active until the page is reloaded.
    }
    window.dispatchEvent(new Event("fridgy-palette-change"));
  }

  return (
    <div className="flex flex-wrap gap-2 md:justify-end" role="group" aria-label={t("title")}>
      {palettes.map(({ value, color }) => (
        <Button
          key={value}
          type="button"
          variant="outline"
          aria-pressed={selected === value}
          className="h-11 gap-2 px-3 aria-pressed:border-primary aria-pressed:bg-secondary"
          onClick={() => choose(value)}
        >
          <span className="size-5 rounded-full border border-foreground/15" style={{ backgroundColor: color }} aria-hidden="true" />
          {t(`options.${value}`)}
        </Button>
      ))}
    </div>
  );
}
