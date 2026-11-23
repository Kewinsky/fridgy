import type { ReactNode } from "react";
import { PublicShell } from "@/components/marketing/public-shell";

export async function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <PublicShell>
      <div className="marketing-page">
        <p className="marketing-kicker">{eyebrow}</p>
        <h1 className="marketing-display mt-5 max-w-3xl text-[clamp(2.8rem,6vw,4.6rem)] leading-[1.04] tracking-[-0.055em]">
          {title}
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#56665a]">
          {intro}
        </p>
        <div className="mt-12">{children}</div>
      </div>
    </PublicShell>
  );
}
