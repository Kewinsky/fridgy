import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, ScanLineIcon, SparklesIcon } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/marketing/public-shell";
import { createClient } from "@/lib/supabase/server";
import { safeAuthPath } from "@/lib/auth-next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Login");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const t = await getTranslations("Login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const params = await searchParams;
  const nextPath = safeAuthPath(params.next);

  if (data.user) {
    redirect(nextPath);
  }

  const initialError = params.error ? t("errors.oauth") : undefined;

  return (
    <PublicShell showStart={false}>
      <div className="marketing-container grid min-h-[calc(100dvh-80px)] items-center gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-20">
        <section className="order-2 lg:order-1">
          <p className="marketing-kicker">{t("eyebrow")}</p>
          <h2 className="marketing-display mt-4 max-w-xl text-[clamp(2.8rem,5vw,5.3rem)] leading-[1.02] tracking-[-0.065em]">{t("sideTitle")}</h2>
          <div className="marketing-login-photo mt-9">
            <Image src="/recipes/miska-z-ciecierzyca.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="marketing-hero-shade" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 text-sm font-semibold text-white sm:p-8">
              <p className="flex items-center gap-3"><ScanLineIcon className="size-5 shrink-0 text-[#d1ebbc]" aria-hidden="true" />{t("receiptBenefit")}</p>
              <p className="flex items-center gap-3"><SparklesIcon className="size-5 shrink-0 text-[#d1ebbc]" aria-hidden="true" />{t("ideasBenefit")}</p>
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="marketing-login-form mx-auto w-full max-w-lg">
            <Link href="/" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#55735a] hover:text-[#203a2b]"><ArrowLeftIcon className="size-4" aria-hidden="true" />{t("home")}</Link>
            <LoginForm initialError={initialError} nextPath={nextPath} />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
