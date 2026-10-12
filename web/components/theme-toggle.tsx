"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      className="fixed top-4 right-4 z-10 size-11 rounded-full shadow-sm sm:top-6 sm:right-6"
      aria-label="Przełącz motyw kolorystyczny"
      title="Przełącz motyw kolorystyczny"
      onClick={toggleTheme}
    >
      <MoonIcon className="size-5 dark:hidden" aria-hidden="true" />
      <SunIcon className="hidden size-5 dark:block" aria-hidden="true" />
    </Button>
  );
}
