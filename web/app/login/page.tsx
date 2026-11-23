import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { BrandIcon, BrandWordmark } from "@/components/brand-icon";
import { LanguageSwitcher } from "@/components/language-switcher";
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
    <main id="main-content" className="marketing grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/brand/login-pantry.jpg"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
        />
      </div>
      <section className="flex min-h-dvh flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2" aria-label={t("home")}>
            <BrandIcon name="logo" className="size-9" />
            <BrandWordmark className="text-xl" />
          </Link>
          <LanguageSwitcher compact />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="marketing-login-form w-full max-w-sm">
            <LoginForm initialError={initialError} nextPath={nextPath} />
          </div>
        </div>
      </section>
    </main>
  );
}
