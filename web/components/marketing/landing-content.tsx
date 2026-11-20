import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRightIcon, LeafIcon, PlayIcon } from "lucide-react";

import {
  HeroProductPreview,
  ProductDemo,
} from "@/components/marketing/product-preview";
import { SubscriptionPricing } from "@/components/subscription-pricing";
import { AnimatedCta } from "@/components/marketing/animated-cta";
import { TypingAnimation } from "@/components/ui/typing-animation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export async function LandingContent() {
  const t = await getTranslations("Marketing");
  const faqT = await getTranslations("PublicPages");
  const questions = ["One", "Two", "Four"] as const;
  const heroEndings = [
    t("heroTitleTwo"),
    t("heroTitleThree"),
    t("heroTitleFour"),
  ];

  return (
    <>
      <section className="marketing-hero">
        <div className="marketing-container marketing-hero-grid">
          <div className="marketing-hero-copy">
            <p className="marketing-hero-eyebrow">
              <LeafIcon className="size-4" aria-hidden="true" />
              {t("heroEyebrow")}
            </p>
            <h1
              className="marketing-display marketing-hero-title"
              aria-label={`${t("heroTitleOne")} ${t("heroTitleTwo")}`}
            >
              <span aria-hidden="true">
                {t("heroTitleOne")}
                <span className="marketing-typed-line">
                  <span className="invisible grid">
                    {heroEndings.map((ending) => (
                      <span key={ending} className="col-start-1 row-start-1">
                        {ending}
                        <span className="inline-block">|</span>
                      </span>
                    ))}
                  </span>
                  <TypingAnimation
                    words={heroEndings}
                    loop
                    duration={65}
                    deleteSpeed={35}
                    pauseDelay={1800}
                    delay={120}
                    startOnView={false}
                    className="absolute inset-0 !leading-[inherit] tracking-[inherit]"
                  />
                </span>
              </span>
            </h1>
            <p className="marketing-hero-description">{t("heroText")}</p>
            <div className="marketing-hero-actions">
              <Link
                href="/login"
                className="marketing-button marketing-button-mint"
              >
                {t("startFree")}
                <ArrowRightIcon className="size-5" aria-hidden="true" />
              </Link>
              <a href="#jak-to-dziala" className="marketing-watch-link">
                <PlayIcon className="size-4" aria-hidden="true" />
                {t("seeHow")}
              </a>
            </div>
          </div>
          <HeroProductPreview />
        </div>
      </section>

      <section
        id="jak-to-dziala"
        className="marketing-container marketing-section"
      >
        <div className="marketing-section-heading">
          <p className="marketing-kicker">{t("demoEyebrow")}</p>
          <h2 className="marketing-display">{t("demoTitle")}</h2>
          <p>{t("demoDescription")}</p>
        </div>
        <ProductDemo />
      </section>

      <section id="cennik" className="marketing-container marketing-section">
        <div className="marketing-section-heading">
          <p className="marketing-kicker">{t("pricingEyebrow")}</p>
          <h2 className="marketing-display">{t("pricingTitle")}</h2>
          <p>{t("pricingText")}</p>
        </div>
        <SubscriptionPricing />
      </section>

      <section className="marketing-container marketing-section marketing-home-faq">
        <div>
          <p className="marketing-kicker">FAQ</p>
          <h2 className="marketing-display">{t("faqTitle")}</h2>
          <Link href="/faq" className="marketing-text-link">
            {t("allQuestions")}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <Accordion multiple hiddenUntilFound>
          {questions.map((question) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger>{faqT(`faq${question}Q`)}</AccordionTrigger>
              <AccordionContent>{faqT(`faq${question}A`)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="marketing-container marketing-final-section">
        <AnimatedCta>
          <h2 className="marketing-display">{t("ctaTitle")}</h2>
          <Link
            href="/login"
            className="marketing-button marketing-button-mint"
          >
            {t("startFree")}
            <ArrowRightIcon className="size-5" aria-hidden="true" />
          </Link>
        </AnimatedCta>
      </section>
    </>
  );
}
