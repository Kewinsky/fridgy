import type { Locale } from "@/i18n/config";
import type { DemoProduct } from "@/lib/demo-data";
import type { Recipe } from "@/lib/demo-recipes";

type RecipeCopy = { title: string; description: string; ingredients: string[] };

const recipeCopy: Record<Exclude<Locale, "pl">, Record<string, RecipeCopy>> = {
  en: {
    "makaron-ze-szpinakiem": { title: "Pasta with spinach", description: "A quick, creamy lunch made with fridge staples.", ingredients: ["Penne pasta", "Baby spinach", "Garlic", "30% cream", "Parmesan"] },
    "kurczak-z-warzywami": { title: "Chicken with vegetables", description: "One pan and very little washing up.", ingredients: ["Chicken breast", "Frozen peas", "Raspberry tomatoes", "Red pepper", "Rice"] },
    "miska-z-ciecierzyca": { title: "Chickpea bowl", description: "A light dinner with crunchy vegetables.", ingredients: ["Chickpeas", "Raspberry tomatoes", "Baby spinach", "Lemon", "Natural yoghurt"] },
    "szakszuka-z-ciecierzyca": { title: "Chickpea shakshuka", description: "A warming tomato dish with runny egg yolks.", ingredients: ["Chickpeas", "Raspberry tomatoes", "Eggs", "Onion", "Cumin"] },
    "chrupiace-zapiekanki": { title: "Crispy open sandwiches", description: "A quick, warm dinner with bread and vegetables.", ingredients: ["Rye bread", "Raspberry tomatoes", "Mushrooms", "Mozzarella", "Natural yoghurt"] },
    "losos-z-groszkiem": { title: "Salmon with peas", description: "A light lunch with creamy lemon yoghurt sauce.", ingredients: ["Atlantic salmon", "Frozen peas", "Natural yoghurt", "Lemon", "Dill"] },
  },
  de: {
    "makaron-ze-szpinakiem": { title: "Pasta mit Spinat", description: "Ein schnelles, cremiges Mittagessen aus Kühlschrankvorräten.", ingredients: ["Penne", "Babyspinat", "Knoblauch", "Sahne", "Parmesan"] },
    "kurczak-z-warzywami": { title: "Hähnchen mit Gemüse", description: "Nur eine Pfanne und kaum Abwasch.", ingredients: ["Hähnchenbrust", "Tiefkühlerbsen", "Tomaten", "Rote Paprika", "Reis"] },
    "miska-z-ciecierzyca": { title: "Kichererbsen-Bowl", description: "Ein leichtes Abendessen mit knackigem Gemüse.", ingredients: ["Kichererbsen", "Tomaten", "Babyspinat", "Zitrone", "Naturjoghurt"] },
    "szakszuka-z-ciecierzyca": { title: "Shakshuka mit Kichererbsen", description: "Ein wärmendes Tomatengericht mit weichem Eigelb.", ingredients: ["Kichererbsen", "Tomaten", "Eier", "Zwiebel", "Kreuzkümmel"] },
    "chrupiace-zapiekanki": { title: "Knusprige Baguettes", description: "Ein schnelles warmes Abendessen mit Brot und Gemüse.", ingredients: ["Roggenbrot", "Tomaten", "Champignons", "Mozzarella", "Naturjoghurt"] },
    "losos-z-groszkiem": { title: "Lachs mit Erbsen", description: "Ein leichtes Essen mit cremiger Joghurt-Zitronen-Sauce.", ingredients: ["Atlantischer Lachs", "Tiefkühlerbsen", "Naturjoghurt", "Zitrone", "Dill"] },
  },
  fr: {
    "makaron-ze-szpinakiem": { title: "Pâtes aux épinards", description: "Un déjeuner rapide et crémeux avec les produits du réfrigérateur.", ingredients: ["Penne", "Jeunes pousses d'épinards", "Ail", "Crème", "Parmesan"] },
    "kurczak-z-warzywami": { title: "Poulet aux légumes", description: "Une seule poêle et très peu de vaisselle.", ingredients: ["Blanc de poulet", "Petits pois surgelés", "Tomates", "Poivron rouge", "Riz"] },
    "miska-z-ciecierzyca": { title: "Bol de pois chiches", description: "Un dîner léger avec des légumes croquants.", ingredients: ["Pois chiches", "Tomates", "Jeunes pousses d'épinards", "Citron", "Yaourt nature"] },
    "szakszuka-z-ciecierzyca": { title: "Chakchouka aux pois chiches", description: "Un plat chaud aux tomates et aux jaunes coulants.", ingredients: ["Pois chiches", "Tomates", "Œufs", "Oignon", "Cumin"] },
    "chrupiace-zapiekanki": { title: "Tartines croustillantes", description: "Un dîner chaud et rapide avec du pain et des légumes.", ingredients: ["Pain de seigle", "Tomates", "Champignons", "Mozzarella", "Yaourt nature"] },
    "losos-z-groszkiem": { title: "Saumon aux petits pois", description: "Un déjeuner léger avec une sauce crémeuse au yaourt et au citron.", ingredients: ["Saumon atlantique", "Petits pois surgelés", "Yaourt nature", "Citron", "Aneth"] },
  },
  es: {
    "makaron-ze-szpinakiem": { title: "Pasta con espinacas", description: "Una comida rápida y cremosa con productos de la nevera.", ingredients: ["Pasta penne", "Espinacas baby", "Ajo", "Nata", "Parmesano"] },
    "kurczak-z-warzywami": { title: "Pollo con verduras", description: "Una sola sartén y muy poco que lavar.", ingredients: ["Pechuga de pollo", "Guisantes congelados", "Tomates", "Pimiento rojo", "Arroz"] },
    "miska-z-ciecierzyca": { title: "Bol de garbanzos", description: "Una cena ligera con verduras crujientes.", ingredients: ["Garbanzos", "Tomates", "Espinacas baby", "Limón", "Yogur natural"] },
    "szakszuka-z-ciecierzyca": { title: "Shakshuka con garbanzos", description: "Un plato caliente de tomate con yemas líquidas.", ingredients: ["Garbanzos", "Tomates", "Huevos", "Cebolla", "Comino"] },
    "chrupiace-zapiekanki": { title: "Tostas crujientes", description: "Una cena caliente y rápida con pan y verduras.", ingredients: ["Pan de centeno", "Tomates", "Champiñones", "Mozzarella", "Yogur natural"] },
    "losos-z-groszkiem": { title: "Salmón con guisantes", description: "Una comida ligera con salsa cremosa de yogur y limón.", ingredients: ["Salmón atlántico", "Guisantes congelados", "Yogur natural", "Limón", "Eneldo"] },
  },
};

const productNames: Record<Exclude<Locale, "pl">, string[]> = {
  en: ["Raspberries", "2% milk", "Baby spinach", "Chicken breast", "Natural yoghurt", "Raspberry tomatoes", "Frozen peas", "Atlantic salmon", "Rye bread", "Penne pasta", "Chickpeas"],
  de: ["Himbeeren", "Milch 2 %", "Babyspinat", "Hähnchenbrust", "Naturjoghurt", "Tomaten", "Tiefkühlerbsen", "Atlantischer Lachs", "Roggenbrot", "Penne", "Kichererbsen"],
  fr: ["Framboises", "Lait 2 %", "Jeunes pousses d'épinards", "Blanc de poulet", "Yaourt nature", "Tomates", "Petits pois surgelés", "Saumon atlantique", "Pain de seigle", "Penne", "Pois chiches"],
  es: ["Frambuesas", "Leche 2 %", "Espinacas baby", "Pechuga de pollo", "Yogur natural", "Tomates", "Guisantes congelados", "Salmón atlántico", "Pan de centeno", "Pasta penne", "Garbanzos"],
};

export function localizeDemoRecipe(recipe: Recipe, locale: Locale): Recipe {
  if (locale === "pl") return recipe;
  const copy = recipeCopy[locale][recipe.slug];
  if (!copy) return recipe;
  return { ...recipe, title: copy.title, description: copy.description, ingredients: recipe.ingredients.map((ingredient, index) => ({ ...ingredient, name: copy.ingredients[index] ?? ingredient.name })) };
}

export function localizeDemoProduct(product: DemoProduct, locale: Locale): DemoProduct {
  if (locale === "pl" || !product.id.startsWith("p")) return product;
  const index = Number(product.id.slice(1));
  return { ...product, name: productNames[locale][index] ?? product.name };
}
