import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, MessagesSquareIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InfoPage } from "@/components/marketing/info-page";
import { ContactForm } from "@/components/marketing/contact-form";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPages");
  return { title: t("contactTitle"), description: t("contactIntro") };
}

export default async function ContactPage() {
  const t = await getTranslations("PublicPages");
  const formT = await getTranslations("ContactForm");
  const config = getSiteConfig();
  return (
    <InfoPage
      eyebrow={t("contactEyebrow")}
      title={t("contactTitle")}
      intro={t("contactIntro")}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <ContactForm />
        <aside className="rounded-2xl border border-border bg-secondary/40 p-6">
          <MessagesSquareIcon
            className="size-7 text-primary"
            aria-hidden="true"
          />
          <h2 className="marketing-display mt-5 text-2xl">
            {formT("helpTitle")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {formT("helpDescription")}
          </p>
          {config.contactEmail ? (
            <p className="mt-4 break-words text-sm">
              <Link
                href={`mailto:${encodeURIComponent(config.contactEmail)}`}
                className="font-semibold text-primary underline underline-offset-4"
              >
                {config.contactEmail}
              </Link>
            </p>
          ) : null}
          <Link
            href="/faq"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("contactFaq")}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </InfoPage>
  );
}
