export type Recipe = {
  slug: string;
  title: string;
  description: string;
  time: number;
  difficulty: string;
  calories: number;
  cuisine: string;
  servings: number;
  ingredients: Array<{
    name: string;
    amount: string;
    available: boolean;
  }>;
  steps: string[];
};

export type DemoRecipe = Recipe;

export const demoRecipes: DemoRecipe[] = [
  {
    slug: "makaron-ze-szpinakiem",
    title: "Makaron ze szpinakiem",
    description: "Kremowy, szybki obiad z produktów z lodówki.",
    time: 25,
    difficulty: "Łatwy",
    calories: 620,
    cuisine: "Włoska",
    servings: 2,
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
    cuisine: "Domowa",
    servings: 2,
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
    cuisine: "Bliskowschodnia",
    servings: 2,
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
  {
    slug: "szakszuka-z-ciecierzyca",
    title: "Szakszuka z ciecierzycą",
    description: "Rozgrzewające danie z pomidorami i płynnym żółtkiem.",
    time: 30,
    difficulty: "Łatwy",
    calories: 510,
    cuisine: "Bliskowschodnia",
    servings: 2,
    ingredients: [
      { name: "Ciecierzyca", amount: "1 puszka", available: true },
      { name: "Pomidory malinowe", amount: "4 szt.", available: true },
      { name: "Jajka", amount: "4 szt.", available: false },
      { name: "Cebula", amount: "1 szt.", available: true },
      { name: "Kumin", amount: "1 łyżeczka", available: false },
    ],
    steps: [
      "Podsmaż posiekaną cebulę z kuminem, aż się zeszkli.",
      "Dodaj pokrojone pomidory i ciecierzycę, a następnie duś przez 10 minut.",
      "Zrób w sosie cztery wgłębienia i wbij do nich jajka.",
      "Przykryj patelnię i gotuj, aż białka się zetną, a żółtka pozostaną płynne.",
    ],
  },
  {
    slug: "chrupiace-zapiekanki",
    title: "Chrupiące zapiekanki",
    description: "Szybka kolacja na ciepło z pieczywa i warzyw.",
    time: 20,
    difficulty: "Bardzo łatwy",
    calories: 560,
    cuisine: "Polska",
    servings: 2,
    ingredients: [
      { name: "Chleb żytni", amount: "4 kromki", available: true },
      { name: "Pomidory malinowe", amount: "2 szt.", available: true },
      { name: "Pieczarki", amount: "200 g", available: false },
      { name: "Mozzarella", amount: "125 g", available: false },
      { name: "Jogurt naturalny", amount: "2 łyżki", available: true },
    ],
    steps: [
      "Podsmaż pokrojone pieczarki, aż odparuje z nich woda.",
      "Posmaruj pieczywo jogurtem i ułóż na nim pomidory oraz pieczarki.",
      "Dodaj porwaną mozzarellę i dopraw pieprzem.",
      "Piecz przez 8–10 minut w 210°C, aż ser się zarumieni.",
    ],
  },
  {
    slug: "losos-z-groszkiem",
    title: "Łosoś z groszkiem",
    description: "Lekki obiad z kremowym sosem jogurtowo-cytrynowym.",
    time: 30,
    difficulty: "Średni",
    calories: 590,
    cuisine: "Europejska",
    servings: 2,
    ingredients: [
      { name: "Łosoś atlantycki", amount: "2 porcje", available: true },
      { name: "Mrożony groszek", amount: "250 g", available: true },
      { name: "Jogurt naturalny", amount: "150 g", available: true },
      { name: "Cytryna", amount: "1 szt.", available: false },
      { name: "Koperek", amount: "1 pęczek", available: false },
    ],
    steps: [
      "Dopraw łososia i piecz przez 15 minut w 190°C.",
      "Ugotuj groszek do miękkości i odcedź.",
      "Połącz jogurt z sokiem z cytryny oraz posiekanym koperkiem.",
      "Podaj łososia z groszkiem i zimnym sosem jogurtowym.",
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

