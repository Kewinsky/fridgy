import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicShell } from "@/components/marketing/public-shell";
import { SubscriptionPricing } from "@/components/subscription-pricing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Billing");
  return { title: t("pricingTitle"), description: t("pricingDescription") };
}

export default async function PricingPage() {
  const t = await getTranslations("Billing");
  return (
    <PublicShell>
      <div className="marketing-container py-16 sm:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="marketing-kicker justify-center">Fridgy Premium</p>
          <h1 className="marketing-display mt-4 text-5xl leading-tight tracking-tight sm:text-6xl">
            {t("pricingTitle")}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {t("pricingDescription")}
          </p>
        </div>
        <div className="mx-auto max-w-4xl">
          <SubscriptionPricing />
        </div>
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-5 text-2xl font-extrabold">{t("faqTitle")}</h2>
          <Accordion multiple hiddenUntilFound>
            {["trial", "households", "cancel", "limits"].map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="py-5">
                  {t(`faq.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent>{t(`faq.${key}.answer`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </PublicShell>
  );
}
