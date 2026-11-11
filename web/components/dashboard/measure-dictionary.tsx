"use client";

import { useTranslations } from "next-intl";

const measures = [
  { name: "teaspoon", volume: 5 },
  { name: "tablespoon", volume: 15 },
  { name: "cup", volume: 240 },
  { name: "glass", volume: 250 },
] as const;

// Gram weights are approximate; the NFZ table gives 5, 15 and 250 ml values.
const ingredients = [
  { name: "water", grams: [5, 15, 240, 250] },
  { name: "milk", grams: [5, 15, 240, 250] },
  { name: "oil", grams: [5, 14, 220, 230] },
  { name: "flour", grams: [3, 10, 155, 160] },
  { name: "oats", grams: [2, 7, 105, 110] },
  { name: "millet", grams: [3, 11, 175, 180] },
  { name: "rice", grams: [4, 14, 220, 230] },
] as const;

export function MeasureDictionary() {
  const t = useTranslations("MeasureDictionary");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {measures.map((measure) => (
          <div key={measure.name} className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-sm font-semibold">{t(measure.name)}</p>
            <p className="mt-1 text-lg font-bold text-primary">{measure.volume} ml</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="ingredient-weights">
        <h2 id="ingredient-weights" className="text-lg font-bold">{t("weightsTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("weightsDescription")}</p>
        <div className="mt-3 space-y-2">
          {ingredients.map((ingredient) => (
            <div key={ingredient.name} className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <h3 className="font-semibold">{t(ingredient.name)}</h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                {measures.map((measure, index) => (
                  <div key={measure.name} className="flex items-baseline justify-between gap-2 border-t border-border pt-2 sm:block">
                    <dt className="text-xs text-muted-foreground">{t(measure.name)}</dt>
                    <dd className="whitespace-nowrap text-sm font-semibold">≈ {ingredient.grams[index]} g</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{t("note")}</p>
      <p className="text-xs text-muted-foreground">
        {t("sources")}: <a className="underline hover:text-foreground" href="https://diety.nfz.gov.pl/images/ebooki/ebook-kuchenne-inspiracje-lato-nfz-druk.pdf" target="_blank" rel="noopener noreferrer">NFZ</a>{" · "}
        <a className="underline hover:text-foreground" href="https://www.gum.gov.pl/ftp/jpg/Biuletyn/biuletyn_3-2015.pdf" target="_blank" rel="noopener noreferrer">GUM</a>
      </p>
    </div>
  );
}
