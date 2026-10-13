export const productCategories = [
  "Owoce",
  "Nabiał",
  "Warzywa",
  "Mięso",
  "Mrożonki",
  "Ryby",
  "Pieczywo",
  "Sypkie",
  "Przetwory",
] as const;

export const productCategoryAppearance: Record<
  string,
  { emoji?: string; className: string }
> = {
  Wszystkie: { className: "bg-secondary text-primary" },
  Owoce: { emoji: "🍎", className: "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200" },
  Nabiał: { emoji: "🥛", className: "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200" },
  Warzywa: { emoji: "🥕", className: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200" },
  Mięso: { emoji: "🥩", className: "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200" },
  Mrożonki: { emoji: "❄️", className: "border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200" },
  Ryby: { emoji: "🐟", className: "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200" },
  Pieczywo: { emoji: "🍞", className: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200" },
  Sypkie: { emoji: "🌾", className: "border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-200" },
  Przetwory: { emoji: "🫙", className: "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-200" },
};
