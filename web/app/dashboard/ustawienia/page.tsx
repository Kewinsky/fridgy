import type { Metadata } from "next";
import { BellIcon, HomeIcon, MapPinIcon, PaletteIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ThemeSettings } from "@/components/dashboard/theme-settings";

export const metadata: Metadata = {
  title: "Ustawienia",
  description: "Ustawienia konta i gospodarstwa domowego.",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Twoje konto" title="Ustawienia" description="Podstawowe preferencje gospodarstwa domowego i wyglądu aplikacji." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="app-card divide-y divide-border">
          <Setting icon={HomeIcon} title="Gospodarstwo domowe" value="Twój dom" />
          <Setting icon={MapPinIcon} title="Region" value="Polska · PLN" />
          <Setting icon={BellIcon} title="Przypomnienia" value="Codziennie o 18:00" />
        </section>
        <section className="app-card p-5">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <PaletteIcon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold">Motyw kolorystyczny</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Wybierz jasny, ciemny lub automatyczny wygląd aplikacji.</p>
            </div>
          </div>
          <div className="mt-5"><ThemeSettings /></div>
        </section>
      </div>
    </>
  );
}

function Setting({ icon: Icon, title, value }: { icon: typeof HomeIcon; title: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-5">
      <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
