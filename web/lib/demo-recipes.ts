export type DemoRecipe = {
  slug: string;
  title: string;
  description: string;
  time: number;
  difficulty: string;
  calories: number;
  ingredients: Array<{
    name: string;
    amount: string;
    available: boolean;
  }>;
  steps: string[];
};

export const demoRecipes: DemoRecipe[] = [
  {
    slug: "makaron-ze-szpinakiem",
    title: "Makaron ze szpinakiem",
    description: "Kremowy, szybki obiad z produktów z lodówki.",
    time: 25,
    difficulty: "Łatwy",
    calories: 620,
    ingredients: [
      { name: "Makaron penne", amount: "200 g", available: true },
      { name: "Szpinak baby", amount: "150 g", available: true },
      { name: "Czosnek", amount: "2 ząbki", available: true },
      { name: "Śmietanka 30%", amount: "150 ml", available: false },
      { name: "Parmezan", amount: "40 g", available: true },
    ],
    steps: [
      "Ugotuj makaron al dente i zachowaj pół szklanki wody z gotowania.",
      "Podsmaż posiekany czosnek, dodaj szpinak i poczekaj, aż zmięknie.",
      "Wlej śmietankę, dodaj makaron i połowę parmezanu. Wymieszaj z odrobiną wody z makaronu.",
      "Dopraw solą i pieprzem, a przed podaniem posyp resztą parmezanu.",
    ],
  },
  {
    slug: "kurczak-z-warzywami",
    title: "Kurczak z warzywami",
    description: "Jedna patelnia i minimum zmywania.",
    time: 35,
    difficulty: "Łatwy",
    calories: 540,
    ingredients: [
      { name: "Pierś z kurczaka", amount: "500 g", available: true },
      { name: "Mrożony groszek", amount: "200 g", available: true },
      { name: "Pomidory malinowe", amount: "2 szt.", available: true },
      { name: "Papryka czerwona", amount: "1 szt.", available: false },
      { name: "Ryż", amount: "160 g", available: true },
    ],
    steps: [
      "Ugotuj ryż zgodnie z instrukcją na opakowaniu.",
      "Pokrój kurczaka i warzywa na podobnej wielkości kawałki.",
      "Obsmaż kurczaka, dodaj paprykę i groszek, a po 5 minutach pomidory.",
      "Dopraw ulubionymi ziołami i podaj z gorącym ryżem.",
    ],
  },
  {
    slug: "miska-z-ciecierzyca",
    title: "Miska z ciecierzycą",
    description: "Lekka kolacja z chrupiącymi warzywami.",
    time: 20,
    difficulty: "Bardzo łatwy",
    calories: 470,
    ingredients: [
      { name: "Ciecierzyca", amount: "1 puszka", available: true },
      { name: "Pomidory malinowe", amount: "2 szt.", available: true },
      { name: "Szpinak baby", amount: "2 garści", available: true },
      { name: "Cytryna", amount: "1 szt.", available: false },
      { name: "Jogurt naturalny", amount: "150 g", available: true },
    ],
    steps: [
      "Odcedź ciecierzycę i podsmaż ją z odrobiną oliwy oraz przyprawami.",
      "Pokrój pomidory i ułóż je w misce razem ze szpinakiem.",
      "Dodaj ciepłą ciecierzycę oraz sos z jogurtu i soku z cytryny.",
      "Wymieszaj tuż przed jedzeniem i dopraw do smaku.",
    ],
  },
];

export function getMissingIngredients(recipe: DemoRecipe) {
  return recipe.ingredients.filter((ingredient) => !ingredient.available);
}

export function getRecipeMatch(recipe: DemoRecipe) {
  const available = recipe.ingredients.filter((ingredient) => ingredient.available).length;
  return { available, total: recipe.ingredients.length };
}

