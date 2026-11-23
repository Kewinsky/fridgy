import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { InfoPage } from "@/components/marketing/info-page";
import { getSiteConfig } from "@/lib/site-config";
import { SUBSCRIPTION_OFFER } from "@/lib/subscription";

const sections = {
  privacy: [
    "data",
    "purposes",
    "preferences",
    "sharing",
    "providers",
    "transfers",
    "retention",
    "storage",
    "rights",
    "changes",
  ],
  terms: [
    "service",
    "account",
    "households",
    "plans",
    "billing",
    "withdrawal",
    "content",
    "safety",
    "complaints",
    "termination",
    "changes",
  ],
} as const;
const linkClass = "font-semibold text-primary underline underline-offset-4";

export async function LegalDocument({ kind }: { kind: "privacy" | "terms" }) {
  const t = await getTranslations("Legal");
  const publicT = await getTranslations("PublicPages");
  const documentT = await getTranslations(`Legal.${kind}`);
  const locale = await getLocale();
  const config = getSiteConfig();
  const contactHref = config.contactEmail
    ? `mailto:${encodeURIComponent(config.contactEmail)}`
    : "/kontakt";
  const details = [
    { label: t("entityName"), value: config.entityName },
    { label: t("address"), value: config.address },
    { label: t("phone"), value: config.phone },
    { label: t("taxId"), value: config.taxId },
    { label: t("registerId"), value: config.registerId },
  ].filter(({ value }) => value);

  return (
    <InfoPage
      eyebrow={publicT(`${kind}Eyebrow`)}
      title={publicT(`${kind}Title`)}
      intro={publicT(`${kind}Intro`)}
    >
      <p className="mx-auto mb-6 max-w-[76ch] text-muted-foreground">
        <span className="text-sm">
          {t("updatedAt", {
            date: new Intl.DateTimeFormat(locale, {
              dateStyle: "long",
              timeZone: "Europe/Warsaw",
            }).format(new Date(`${config.legalUpdatedAt}T12:00:00Z`)),
          })}
        </span>
      </p>
      <article className="marketing-prose break-words">
        <section id="legal-provider" className="scroll-mt-8">
          <h2 className="!mt-0">1. {documentT("providerTitle")}</h2>
          <p>{documentT("providerDescription", { name: config.entityName })}</p>
          <dl className="mt-5 space-y-3 text-sm">
            {details.map(({ label, value }) => (
              <div
                key={label}
                className="grid gap-1 sm:grid-cols-[160px_minmax(0,1fr)]"
              >
                <dt className="font-semibold">{label}</dt>
                <dd className="break-words whitespace-pre-line">{value}</dd>
              </div>
            ))}
            <div className="grid gap-1 sm:grid-cols-[160px_minmax(0,1fr)]">
              <dt className="font-semibold">{t("contact")}</dt>
              <dd className="min-w-0 break-words">
                <Link href={contactHref} className={linkClass}>
                  {config.contactEmail || t("contactForm")}
                </Link>
              </dd>
            </div>
          </dl>
        </section>
        {sections[kind].map((section, index) => (
          <section
            key={section}
            id={`legal-${section}`}
            className="scroll-mt-8"
          >
            <h2>
              {index + 2}. {documentT(`${section}.title`)}
            </h2>
            <p>
              {documentT.rich(`${section}.body`, {
                trialDays: SUBSCRIPTION_OFFER.trialDays,
                processors: config.processors,
                contact: (chunks) => (
                  <Link href={contactHref} className={linkClass}>
                    {chunks}
                  </Link>
                ),
                pricing: (chunks) => (
                  <Link href="/cennik" className={linkClass}>
                    {chunks}
                  </Link>
                ),
                settings: (chunks) => (
                  <Link
                    href="/dashboard/ustawienia?tab=billing"
                    className={linkClass}
                  >
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link href="/prywatnosc" className={linkClass}>
                    {chunks}
                  </Link>
                ),
                authority: (chunks) => (
                  <a href="https://uodo.gov.pl/" className={linkClass}>
                    {chunks}
                  </a>
                ),
                consumer: (chunks) => (
                  <a
                    href="https://polubowne.uokik.gov.pl/"
                    className={linkClass}
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </section>
        ))}
      </article>
    </InfoPage>
  );
}
