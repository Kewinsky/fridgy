"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import {
  ArrowRightIcon,
  CheckIcon,
  CheckCheckIcon,
  ChefHatIcon,
  Clock3Icon,
  LeafIcon,
  ListChecksIcon,
  MilkIcon,
  PackageCheckIcon,
  PauseIcon,
  PlayIcon,
  ScanLineIcon,
  SparklesIcon,
  WheatIcon,
} from "lucide-react";

import { BrandIcon, BrandWordmark } from "@/components/brand-icon";
import { ProductWalkthrough } from "@/components/marketing/product-walkthrough";
import { MARKETING_MEDIA } from "@/lib/marketing-media";
import { cn } from "@/lib/utils";

const demoSteps = ["receipt", "inventory", "recipe"] as const;
const DEMO_STEP_DURATION_MS = 5000;
type DemoStep = (typeof demoSteps)[number];
const stepIcons = {
  receipt: ScanLineIcon,
  inventory: PackageCheckIcon,
  recipe: ChefHatIcon,
};
const previewProducts = [
  { key: "spinach", amount: "150 g", icon: LeafIcon },
  { key: "pasta", amount: "200 g", icon: WheatIcon },
  { key: "cream", amount: "100 ml", icon: MilkIcon },
] as const;

function InventoryPreview() {
  const t = useTranslations("Marketing");
  return (
    <div className="preview-inventory">
      <div className="preview-screen-heading">
        <span>{t("preview.inventoryTitle")}</span>
        <PackageCheckIcon className="size-5" aria-hidden="true" />
      </div>
      <p className="preview-screen-description">
        {t("preview.inventoryDescription")}
      </p>
      {previewProducts.map(({ key, amount, icon: Icon }, index) => (
        <div key={key} className="preview-stock-row">
          <span className={cn("preview-food-icon", `preview-food-${key}`)}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <strong>{t(`preview.${key}`)}</strong>
            <span>{amount}</span>
          </div>
          {index === 0 ? (
            <span className="preview-use-soon">{t("preview.useFirst")}</span>
          ) : (
            <CheckIcon
              className="ml-auto size-4 text-primary"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
      <div className="preview-inventory-hint">
        <SparklesIcon className="size-4 shrink-0" aria-hidden="true" />
        <span>{t("preview.inventoryHint")}</span>
      </div>
    </div>
  );
}

function ReceiptPreview() {
  const t = useTranslations("Marketing");
  return (
    <div className="preview-receipt">
      <ScanLineIcon className="mx-auto size-6" aria-hidden="true" />
      <p className="preview-receipt-heading">{t("preview.receiptTitle")}</p>
      {["spinach", "pasta", "cream"].map((item) => (
        <div key={item} className="preview-receipt-row">
          <span>{t(`preview.${item}`)}</span>
          <CheckIcon className="size-4" aria-hidden="true" />
        </div>
      ))}
      <span className="preview-receipt-barcode" aria-hidden="true" />
      <p className="preview-receipt-status">
        <CheckCheckIcon className="size-4" aria-hidden="true" />
        {t("preview.receiptReady")}
      </p>
    </div>
  );
}

function RecipePreview({ hero = false }: { hero?: boolean }) {
  const t = useTranslations("Marketing");
  const recipeT = useTranslations("Recipe");
  return (
    <div className="preview-recipe">
      <div className="preview-recipe-image">
        <Image
          src="/recipes/makaron-ze-szpinakiem.webp"
          alt={t("preview.recipeTitle")}
          fill
          sizes={hero ? "240px" : "(max-width: 768px) 80vw, 480px"}
          preload={hero}
          className="object-cover"
        />
      </div>
      <div className="preview-recipe-details">
        <span className="preview-recipe-tag">
          <SparklesIcon className="size-3" aria-hidden="true" />
          {t("preview.fromYourKitchen")}
        </span>
        <strong>{t("preview.recipeTitle")}</strong>
        <span className="preview-recipe-time">
          <Clock3Icon className="size-3.5" aria-hidden="true" />
          {recipeT("minutes", { count: 25 })}
        </span>
      </div>
    </div>
  );
}

export function HeroProductPreview() {
  const t = useTranslations("Marketing");
  return (
    <figure className="marketing-collage" aria-label={t("demoTitle")}>
      <div className="marketing-collage-orbit" aria-hidden="true" />
      <div className="marketing-collage-receipt">
        <ReceiptPreview />
      </div>
      <div className="marketing-collage-phone">
        <div className="preview-phone-speaker" aria-hidden="true" />
        <div className="preview-phone-brand">
          <BrandIcon name="logo" className="size-7" />
          <BrandWordmark className="text-lg" />
        </div>
        <InventoryPreview />
        <div className="preview-phone-action">
          {t("preview.cookAction")}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </div>
        <div className="preview-phone-navigation" aria-hidden="true">
          <PackageCheckIcon />
          <ChefHatIcon />
          <ListChecksIcon />
        </div>
      </div>
      <div className="marketing-collage-recipe">
        <RecipePreview hero />
      </div>
    </figure>
  );
}

export function ProductDemo() {
  const t = useTranslations("Marketing");
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState<DemoStep>("receipt");
  const [playing, setPlaying] = useState(true);

  if (MARKETING_MEDIA.demoVideo)
    return (
      <div className="marketing-video-frame">
        <video
          controls
          playsInline
          preload="none"
          poster={MARKETING_MEDIA.demoPoster || undefined}
          aria-label={t("demoTitle")}
        >
          <source src={MARKETING_MEDIA.demoVideo} type="video/mp4" />
          {MARKETING_MEDIA.demoCaptions ? (
            <track
              kind="captions"
              src={MARKETING_MEDIA.demoCaptions}
              srcLang="pl"
              label="Polski"
              default
            />
          ) : null}
        </video>
      </div>
    );

  return (
    <div className="marketing-product-demo">
      <div className="demo-content">
        <div
          className="demo-step-list"
          role="group"
          aria-label={t("demoStepsLabel")}
        >
          {demoSteps.map((value, index) => {
            const Icon = stepIcons[value];
            return (
              <button
                key={value}
                type="button"
                aria-pressed={step === value}
                aria-controls="product-demo-screen"
                onClick={() => {
                  setStep(value);
                  setPlaying(false);
                }}
                className={cn("demo-step", step === value && "is-active")}
              >
                <span className="demo-step-number">0{index + 1}</span>
                <span>
                  <strong>{t(`demo.${value}.title`)}</strong>
                  <small>{t(`demo.${value}.description`)}</small>
                </span>
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {step === value ? (
                  <span className="demo-step-progress" aria-hidden="true">
                    <span
                      className={cn("demo-step-timer", !playing && "is-paused")}
                      style={{
                        animationDuration: `${DEMO_STEP_DURATION_MS}ms`,
                      }}
                      onAnimationIteration={() => {
                        if (playing && !reducedMotion) {
                          setStep(
                            (current) =>
                              demoSteps[
                                (demoSteps.indexOf(current) + 1) %
                                  demoSteps.length
                              ],
                          );
                        }
                      }}
                    />
                  </span>
                ) : null}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPlaying((current) => !current)}
            className="demo-play-button"
          >
            {playing ? (
              <PauseIcon className="size-4" aria-hidden="true" />
            ) : (
              <PlayIcon className="size-4" aria-hidden="true" />
            )}
            {t(playing ? "pausePreview" : "playPreview")}
          </button>
        </div>
        <div
          id="product-demo-screen"
          className={cn("demo-screen", `demo-screen-${step}`)}
          aria-live={playing ? "off" : "polite"}
        >
          <ProductWalkthrough step={step} playing={playing} />
        </div>
      </div>
    </div>
  );
}
