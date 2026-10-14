export const cuisines = [
  "Domowa",
  "Polska",
  "Włoska",
  "Azjatycka",
  "Meksykańska",
  "Śródziemnomorska",
  "Bliskowschodnia",
  "Amerykańska",
  "Europejska",
  "Inna",
] as const;

export type Cuisine = (typeof cuisines)[number];

export const cuisineMessageKeys: Record<Cuisine, string> = {
  Domowa: "home",
  Polska: "polish",
  Włoska: "italian",
  Azjatycka: "asian",
  Meksykańska: "mexican",
  Śródziemnomorska: "mediterranean",
  Bliskowschodnia: "middleEastern",
  Amerykańska: "american",
  Europejska: "european",
  Inna: "other",
};

export const difficultyMessageKeys: Record<string, string> = {
  "Bardzo łatwy": "veryEasy",
  Łatwy: "easy",
  Średni: "medium",
  "Własny przepis": "custom",
};

export function isCuisine(value: string): value is Cuisine {
  return cuisines.some((cuisine) => cuisine === value);
}
