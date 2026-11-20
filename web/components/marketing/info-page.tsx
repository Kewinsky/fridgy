import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("PublicPages");
  return (
    <PublicShell>
      <div className="marketing-page">
        <Link
          href="/"
          className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#55735a] hover:text-[#203a2b]"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          {t("back")}
        </Link>
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
