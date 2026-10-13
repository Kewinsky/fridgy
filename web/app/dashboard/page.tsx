import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  LeafIcon,
  ListChecksIcon,
  PackageCheckIcon,
  ScanLineIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Przegląd Twoich domowych zapasów.",
};

export default function DashboardPage() {
  return (
    <>
      <section className="relative overflow-hidden rounded-xl bg-surface-strong p-6 text-surface-strong-foreground sm:p-8">
        <div className="strong-grid absolute inset-0" />
        <div className="relative max-w-xl">
          <p className="text-sm font-bold text-surface-strong-accent">Twój pierwszy dzień</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Cześć! Co dziś zjemy?</h1>
          <p className="mt-3 text-sm leading-6 text-surface-strong-foreground/75">
            Dodaj pierwsze produkty, aby Fridgy mogło pilnować zapasów i podpowiadać, co warto wykorzystać.
          </p>
          <Button nativeButton={false} render={<Link href="/dashboard/dodaj-paragon" />} className="mt-6 h-11">
            <ScanLineIcon aria-hidden="true" />
            Dodaj pierwszy paragon
          </Button>
        </div>
      </section>

      <section aria-label="Podsumowanie" className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric icon={PackageCheckIcon} value="0" label="produktów w domu" />
        <Metric icon={SparklesIcon} value="0" label="do wykorzystania" />
        <Metric icon={ListChecksIcon} value="0" label="na liście zakupów" />
      </section>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="app-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Najpierw to</p>
              <h2 className="mt-1 text-xl font-extrabold">Warto wykorzystać</h2>
            </div>
            <Link href="/dashboard/zapasy" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Zobacz <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-fresh-soft text-fresh">
              <LeafIcon aria-hidden="true" />
            </span>
            <p className="mt-4 font-bold">Tu pojawią się Twoje produkty</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Gdy dodasz zakupy, pokażemy rzeczy, które najlepiej wykorzystać jako pierwsze.
            </p>
          </div>
        </section>

        <section className="app-card p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Pierwsze kroki</p>
          <h2 className="mt-1 text-xl font-extrabold">Przygotuj swoją kuchnię</h2>
          <ol className="mt-5 space-y-4">
            <Step number="1" label="Dodaj pierwszy paragon" />
            <Step number="2" label="Sprawdź rozpoznane produkty" />
            <Step number="3" label="Zobacz, co warto ugotować" />
          </ol>
        </section>
      </div>
    </>
  );
}

function Metric({ icon: Icon, value, label }: { icon: typeof LeafIcon; value: string; label: string }) {
  return (
    <div className="app-card flex items-center gap-4 p-4">
      <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl font-extrabold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Step({ number, label }: { number: string; label: string }) {
  return (
    <li className="flex items-center gap-3 text-sm font-semibold">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-primary">
        {number}
      </span>
      {label}
    </li>
  );
}
