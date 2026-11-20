"use client";

import { useTranslations } from "next-intl";
import {
  AppleIcon,
  ArrowRightIcon,
  BeanIcon,
  CarrotIcon,
  CheckIcon,
  ChefHatIcon,
  Clock3Icon,
  MousePointer2Icon,
  PackageCheckIcon,
  ScanLineIcon,
  SparklesIcon,
} from "lucide-react";

const products = [
  { key: "tomatoes", amount: "500 g", icon: AppleIcon },
  { key: "zucchini", amount: "400 g", icon: CarrotIcon },
  { key: "chickpeas", amount: "250 g", icon: BeanIcon },
] as const;

export function ProductWalkthrough({
  step,
  playing,
}: {
  step: "receipt" | "inventory" | "recipe";
  playing: boolean;
}) {
  const t = useTranslations("Marketing.walkthrough");
  const recipeT = useTranslations("Recipe");

  return (
    <div
      key={step}
      className={`demo-ui demo-ui-${step}`}
      data-playing={playing}
    >
      <div className="demo-ui-toolbar">
        <span className="demo-ui-app-dot" aria-hidden="true" />
        <span>Fridgy</span>
        <span className="demo-ui-toolbar-path">/ {t(step)}</span>
      </div>
      {step === "receipt" ? (
        <div className="demo-ui-body">
          <span className="demo-ui-eyebrow">
            <ScanLineIcon aria-hidden="true" />
            {t("scanComplete")}
          </span>
          <h3>{t("review")}</h3>
          <div className="demo-ui-product-list">
            {products.map(({ key, amount }, index) => (
              <div
                key={key}
                className={`demo-ui-review-row demo-ui-sequence-${index}`}
              >
                <span className="demo-ui-checkbox" aria-hidden="true">
                  <CheckIcon />
                </span>
                <strong>{t(key)}</strong>
                <span className="demo-ui-amount">{amount}</span>
              </div>
            ))}
          </div>
          <span className="demo-ui-action">
            {t("save", { count: products.length })}
            <ArrowRightIcon aria-hidden="true" />
          </span>
          <span className="demo-ui-confirmation">
            <CheckIcon aria-hidden="true" />
            {t("reviewed")}
          </span>
        </div>
      ) : null}
      {step === "inventory" ? (
        <div className="demo-ui-body">
          <span className="demo-ui-eyebrow">
            <PackageCheckIcon aria-hidden="true" />
            {t("updated")}
          </span>
          <div className="demo-ui-heading">
            <h3>{t("inventory")}</h3>
            <span className="demo-ui-location">{t("fridge")}</span>
          </div>
          <div className="demo-ui-product-list">
            {products.map(({ key, amount, icon: Icon }, index) => (
              <div
                key={key}
                className={`demo-ui-stock-row demo-ui-sequence-${index}`}
              >
                <span className={`demo-ui-food demo-ui-food-${key}`}>
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <strong>{t(key)}</strong>
                  <span className="demo-ui-stock-amount">{amount}</span>
                </div>
                {index === 0 ? (
                  <span className="demo-ui-expiry">
                    {t("useFirst")}
                    <strong>{t("days", { count: 2 })}</strong>
                  </span>
                ) : (
                  <CheckIcon
                    className="demo-ui-stock-check"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
          <span className="demo-ui-note">
            <Clock3Icon aria-hidden="true" />
            {t("freshness")}
          </span>
        </div>
      ) : null}
      {step === "recipe" ? (
        <div className="demo-ui-body">
          <span className="demo-ui-eyebrow">
            <SparklesIcon aria-hidden="true" />
            {t("matched")}
          </span>
          <div className="demo-ui-recipe-heading">
            <span className="demo-ui-chef">
              <ChefHatIcon aria-hidden="true" />
            </span>
            <div>
              <h3>{t("recipeTitle")}</h3>
              <span className="demo-ui-recipe-time">
                <Clock3Icon aria-hidden="true" />
                {recipeT("minutes", { count: 25 })}
              </span>
            </div>
          </div>
          <span className="demo-ui-match">
            {t("ingredientsReady", { count: products.length })}
          </span>
          <div className="demo-ui-ingredients">
            {products.map(({ key }, index) => (
              <div
                key={key}
                className={`demo-ui-ingredient demo-ui-sequence-${index}`}
              >
                <CheckIcon aria-hidden="true" />
                <span>{t(key)}</span>
                <span className="demo-ui-available">{t("available")}</span>
              </div>
            ))}
          </div>
          <span className="demo-ui-action">
            {t("openRecipe")}
            <ArrowRightIcon aria-hidden="true" />
          </span>
        </div>
      ) : null}
      <span className="demo-ui-cursor" aria-hidden="true">
        <MousePointer2Icon />
      </span>
    </div>
  );
}
