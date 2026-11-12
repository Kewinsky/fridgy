"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDownIcon, ArrowRightIcon, CameraIcon, CheckIcon, ChefHatIcon, HouseIcon, LeafIcon, ListChecksIcon, MinusIcon, ScanLineIcon, SparklesIcon, TimerIcon } from "lucide-react";

const HERO_VIDEO_SRC = ""; // Add the final film to public/ and set its path here.
// shortcut: planned prices are display only, move them to the billing source when subscriptions launch.
const PREMIUM_PRICES = { monthly: 19.99, yearly: 149.99 };

export function LandingContent() {
  const t = useTranslations("Marketing");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "PLN" });
  const reveal = reduceMotion ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6, ease: "easeOut" as const } };
  const steps = [
    { icon: HouseIcon, number: "01", title: t("stepOneTitle"), text: t("stepOneText") },
    { icon: ScanLineIcon, number: "02", title: t("stepTwoTitle"), text: t("stepTwoText") },
    { icon: ChefHatIcon, number: "03", title: t("stepThreeTitle"), text: t("stepThreeText") },
  ];
  const features = [
    { icon: TimerIcon, title: t("featureDatesTitle"), text: t("featureDatesText"), number: "01" },
    { icon: ListChecksIcon, title: t("featureListTitle"), text: t("featureListText"), number: "02" },
    { icon: LeafIcon, title: t("featureDietTitle"), text: t("featureDietText"), number: "03" },
  ];
  const pricingRows = [
    { label: t("pricingRecipes"), free: t("pricingFive"), premium: t("pricingUnlimited") },
    { label: t("pricingAi"), free: t("pricingFiveTotal"), premium: t("pricingThirtyMonthly") },
    { label: t("pricingScans"), free: t("pricingTwoMonthly"), premium: t("pricingTwentyMonthly") },
    { label: t("pricingMembers"), free: t("pricingOne"), premium: t("pricingSix") },
    { label: t("pricingDailyIdea"), free: t("pricingNo"), premium: t("pricingYes") },
  ];

  return (
    <>
      <section className="marketing-container grid items-center gap-10 pb-16 pt-12 lg:grid-cols-[0.93fr_1.07fr] lg:gap-14 lg:pb-24 lg:pt-20">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: "easeOut" }}>
          <div className="marketing-eyebrow"><span className="marketing-eyebrow-line" />{t("heroEyebrow")}</div>
          <h1 className="marketing-display mt-7 max-w-[680px] text-[clamp(3.5rem,7vw,7.2rem)] leading-[0.94] tracking-[-0.075em]">
            {t("heroTitleOne")}<br /><span className="marketing-display-accent">{t("heroTitleTwo")}</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[#526359] sm:text-xl">{t("heroText")}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/login" className="marketing-button">{t("startFree")}<ArrowRightIcon className="size-5" aria-hidden="true" /></Link>
            <a href="#jak-to-dziala" className="marketing-button marketing-button-outline">{t("seeHow")}<ArrowDownIcon className="size-4" aria-hidden="true" /></a>
          </div>
          <p className="mt-5 text-sm text-[#6e7a70]">{t("heroNote")}</p>
        </motion.div>
        <motion.div className="marketing-hero-media" initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}>
          <div className="marketing-hero-image">
            {HERO_VIDEO_SRC && !reduceMotion ? (
              <video autoPlay muted loop playsInline poster="/recipes/szakszuka-z-ciecierzyca.webp" className="absolute inset-0 size-full object-cover" aria-hidden="true">
                <source src={HERO_VIDEO_SRC} type="video/mp4" />
              </video>
            ) : (
              <Image src="/recipes/szakszuka-z-ciecierzyca.webp" alt={t("heroImageAlt")} fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover" />
            )}
            <div className="marketing-hero-shade" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d5e8ba]">{t("heroVisualLabel")}</p>
              <p className="marketing-display mt-2 max-w-md text-3xl leading-tight tracking-[-0.05em] sm:text-4xl">{t("heroVisualText")}</p>
            </div>
          </div>
          <motion.div className="marketing-float-card" animate={reduceMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <span className="flex size-11 items-center justify-center rounded-full bg-[#e5efdb] text-[#28553c]"><SparklesIcon className="size-5" aria-hidden="true" /></span>
            <span><strong className="block text-sm">{t("floatTitle")}</strong><small className="mt-0.5 block text-xs text-[#69776b]">{t("floatText")}</small></span>
          </motion.div>
          <span className="marketing-media-index" aria-hidden="true">01 / 03</span>
        </motion.div>
      </section>

      <section className="marketing-band" aria-label={t("bandLabel")}>
        <div className="marketing-container flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-5 text-center text-sm font-semibold text-[#3e5b46] sm:justify-between">
          <span><HouseIcon className="mr-2 inline size-4" aria-hidden="true" />{t("bandHome")}</span>
          <span><CameraIcon className="mr-2 inline size-4" aria-hidden="true" />{t("bandReceipt")}</span>
          <span><ChefHatIcon className="mr-2 inline size-4" aria-hidden="true" />{t("bandCook")}</span>
        </div>
      </section>

      <section id="jak-to-dziala" className="marketing-container scroll-mt-24 py-24 lg:py-32">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="marketing-kicker">{t("stepsEyebrow")}</p>
          <h2 className="marketing-display mt-4 text-[clamp(2.6rem,5vw,5rem)] leading-[1.04] tracking-[-0.065em]">{t("stepsTitle")}</h2>
          <p className="mt-5 text-lg leading-7 text-[#5b6b5e]">{t("stepsIntro")}</p>
        </motion.div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article key={step.number} {...reveal} transition={{ duration: 0.55, delay: index * 0.1 }} className="marketing-step-card">
              <div className="flex items-start justify-between"><span className="marketing-step-icon"><step.icon className="size-7" strokeWidth={1.7} aria-hidden="true" /></span><span className="marketing-card-number">{step.number}</span></div>
              <h3 className="marketing-display mt-12 text-[1.9rem] leading-tight tracking-[-0.05em]">{step.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[#5d6d61]">{step.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="mozliwosci" className="marketing-features scroll-mt-20">
        <div className="marketing-container grid gap-12 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:py-32">
          <motion.div {...reveal} className="lg:sticky lg:top-32 lg:self-start">
            <p className="marketing-kicker text-[#c2ddb5]">{t("featuresEyebrow")}</p>
            <h2 className="marketing-display mt-4 text-[clamp(2.8rem,5vw,5.2rem)] leading-[1.03] tracking-[-0.065em]">{t("featuresTitle")}</h2>
            <p className="mt-6 max-w-sm text-lg leading-7 text-[#bdd0bd]">{t("featuresIntro")}</p>
          </motion.div>
          <div className="divide-y divide-white/20 border-y border-white/20">
            {features.map((feature, index) => (
              <motion.article key={feature.number} {...reveal} transition={{ duration: 0.55, delay: index * 0.08 }} className="grid gap-5 py-8 sm:grid-cols-[70px_1fr] sm:py-10">
                <span className="flex size-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[#d4e9c7]"><feature.icon className="size-7" strokeWidth={1.7} aria-hidden="true" /></span>
                <div><span className="text-xs font-semibold tracking-[0.2em] text-[#a8c4a8]">{feature.number} / 03</span><h3 className="marketing-display mt-2 text-3xl tracking-[-0.04em]">{feature.title}</h3><p className="mt-3 max-w-lg leading-7 text-[#bfd0bf]">{feature.text}</p></div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="cennik" className="marketing-container scroll-mt-24 py-24 lg:py-32">
        <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
          <p className="marketing-kicker justify-center">{t("pricingEyebrow")}</p>
          <h2 className="marketing-display mt-4 text-[clamp(2.8rem,5vw,5.2rem)] leading-[1.03] tracking-[-0.065em]">{t("pricingTitle")}</h2>
          <p className="mt-5 text-lg leading-7 text-[#5b6b5e]">{t("pricingText")}</p>
        </motion.div>
        <div role="group" aria-label={t("pricingBillingLabel")} className="mx-auto mt-8 flex w-fit rounded-full border border-[#dce3d6] bg-[#e8eee4] p-1">
          <button type="button" aria-pressed={billing === "monthly"} onClick={() => setBilling("monthly")} className={`marketing-billing-option ${billing === "monthly" ? "is-active" : ""}`}>{t("pricingMonthly")}</button>
          <button type="button" aria-pressed={billing === "yearly"} onClick={() => setBilling("yearly")} className={`marketing-billing-option ${billing === "yearly" ? "is-active" : ""}`}>{t("pricingYearly")}</button>
        </div>
        <div className="mx-auto mt-9 grid max-w-5xl gap-5 md:grid-cols-2">
          <motion.article {...reveal} className="marketing-pricing-card">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#547a57]">Free</p>
            <h3 className="marketing-display mt-3 text-3xl">{t("pricingFreeTitle")}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-[#5b6b5e]">{t("pricingFreeText")}</p>
            <div className="mt-8 border-b border-[#dce3d6] pb-8">
              <span className="marketing-display text-5xl tracking-[-0.06em]">{currency.format(0)}</span>
              <span className="ml-2 text-sm text-[#5b6b5e]">/ {t("pricingMonthlyShort")}</span>
            </div>
            <ul className="mt-7 space-y-5">
              {pricingRows.map((row) => (
                <li key={row.label} className="flex items-start gap-3 text-sm">
                  {row.free === t("pricingNo") ? <MinusIcon className="mt-0.5 size-4 shrink-0 text-[#8b978b]" aria-hidden="true" /> : <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#5b8a61]" aria-hidden="true" />}
                  <span><strong className="font-semibold">{row.label}</strong><span className="block text-[#68796c]">{row.free}</span></span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="marketing-button marketing-button-outline mt-9 w-full">{t("pricingFreeAction")}<ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
          </motion.article>
          <motion.article {...reveal} className="marketing-pricing-card marketing-pricing-card-premium">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c4ddb7]">Premium</p>
            <h3 className="marketing-display mt-3 text-3xl">{t("pricingPremiumTitle")}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-[#d2e0d0]">{t("pricingPremiumText")}</p>
            <div className="mt-8 border-b border-white/20 pb-8" aria-live="polite">
              <motion.span key={billing} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="marketing-display inline-block text-5xl tracking-[-0.06em]">{currency.format(PREMIUM_PRICES[billing])}</motion.span>
              <span className="ml-2 text-sm text-[#d2e0d0]">/ {billing === "monthly" ? t("pricingMonthlyShort") : t("pricingYearlyShort")}</span>
            </div>
            <ul className="mt-7 space-y-5">
              {pricingRows.map((row) => <li key={row.label} className="flex items-start gap-3 text-sm"><CheckIcon className="mt-0.5 size-4 shrink-0 text-[#b9d7a4]" aria-hidden="true" /><span><strong className="font-semibold">{row.label}</strong><span className="block text-[#d2e0d0]">{row.premium}</span></span></li>)}
            </ul>
            <p className="mt-9 flex min-h-[54px] items-center justify-center rounded-full border border-white/30 px-6 text-center text-sm font-bold">{t("pricingPremiumAction")}</p>
          </motion.article>
        </div>
        <p className="mx-auto mt-7 max-w-3xl text-center text-sm leading-6 text-[#68796c]">{t("pricingDisclaimer")}</p>
      </section>

      <section className="marketing-container py-24 lg:py-32">
        <motion.div {...reveal} className="marketing-cta">
          <div className="relative z-10 max-w-2xl">
            <p className="marketing-kicker">{t("ctaEyebrow")}</p>
            <h2 className="marketing-display mt-4 text-[clamp(2.8rem,5vw,5.3rem)] leading-[1.02] tracking-[-0.065em]">{t("ctaTitle")}</h2>
            <p className="mt-5 max-w-lg text-lg leading-7 text-[#5d6b5f]">{t("ctaText")}</p>
            <Link href="/login" className="marketing-button mt-8">{t("startFree")}<ArrowRightIcon className="size-5" aria-hidden="true" /></Link>
          </div>
          <div className="marketing-cta-art" aria-hidden="true"><span>F</span></div>
        </motion.div>
      </section>
    </>
  );
}
