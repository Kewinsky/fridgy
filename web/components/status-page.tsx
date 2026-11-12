import type { ComponentProps, ReactNode } from "react";

import { BrandIcon } from "@/components/brand-icon";

export function StatusPage({
  icon,
  label,
  title,
  description,
  detail,
  actions,
  tone = "primary",
  embedded = false,
}: {
  icon: ComponentProps<typeof BrandIcon>["name"];
  label: string;
  title: string;
  description: string;
  detail?: string;
  actions: ReactNode;
  tone?: "primary" | "destructive";
  embedded?: boolean;
}) {
  const Container = embedded ? "div" : "main";

  return (
    <Container className={`grid min-h-dvh place-items-center bg-background px-4 py-16 text-foreground ${embedded ? "fixed inset-0 z-50 overflow-y-auto" : ""}`}>
      <section className="w-full max-w-lg text-center" aria-live="polite">
        <BrandIcon name={icon} className="mx-auto size-24" />
        <p className={`mt-6 text-sm font-bold uppercase tracking-wider ${tone === "destructive" ? "text-destructive" : "text-primary"}`}>{label}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        {detail ? <p className="mt-2 text-xs text-muted-foreground">{detail}</p> : null}
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">{actions}</div>
      </section>
    </Container>
  );
}
