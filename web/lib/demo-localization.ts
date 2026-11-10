import type { Locale } from "@/i18n/config";
import type { DemoProduct } from "@/lib/demo-data";
import type { Recipe } from "@/lib/demo-recipes";
import type { ShoppingItem } from "@/lib/shopping-list";

type RecipeCopy = { title: string; description: string; ingredients: string[] };

const unitNames: Record<Exclude<Locale, "pl">, Record<string, [string, string]>> = {
  en: { "szt.": ["pc", "pcs"], "opak.": ["pack", "packs"], puszka: ["can", "cans"], porcje: ["portion", "portions"], kromki: ["slice", "slices"], ząbki: ["clove", "cloves"], garści: ["handful", "handfuls"], łyżki: ["tbsp", "tbsp"], łyżeczka: ["tsp", "tsp"], pęczek: ["bunch", "bunches"] },
  de: { "szt.": ["Stück", "Stück"], "opak.": ["Packung", "Packungen"], puszka: ["Dose", "Dosen"], porcje: ["Portion", "Portionen"], kromki: ["Scheibe", "Scheiben"], ząbki: ["Zehe", "Zehen"], garści: ["Handvoll", "Handvoll"], łyżki: ["EL", "EL"], łyżeczka: ["TL", "TL"], pęczek: ["Bund", "Bund"] },
  fr: { "szt.": ["pièce", "pièces"], "opak.": ["paquet", "paquets"], puszka: ["boîte", "boîtes"], porcje: ["portion", "portions"], kromki: ["tranche", "tranches"], ząbki: ["gousse", "gousses"], garści: ["poignée", "poignées"], łyżki: ["c. à soupe", "c. à soupe"], łyżeczka: ["c. à café", "c. à café"], pęczek: ["bouquet", "bouquets"] },
  es: { "szt.": ["ud.", "uds."], "opak.": ["paquete", "paquetes"], puszka: ["lata", "latas"], porcje: ["ración", "raciones"], kromki: ["rebanada", "rebanadas"], ząbki: ["diente", "dientes"], garści: ["puñado", "puñados"], łyżki: ["cda.", "cdas."], łyżeczka: ["cdta.", "cdtas."], pęczek: ["manojo", "manojos"] },
};

export function localizeUnit(unit: string, quantity: number, locale: Locale): string {
  if (locale === "pl") return unit;
  const names = unitNames[locale][unit];
  return names ? names[quantity === 1 ? 0 : 1] : unit;
}

export function localizeAmount(amount: string, locale: Locale): string {
  if (locale === "pl") return amount;
  const match = amount.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
  if (!match) return amount;
  return `${match[1]} ${localizeUnit(match[2], Number(match[1].replace(",", ".")), locale)}`;
}

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

const recipeSteps: Record<Exclude<Locale, "pl">, Record<string, string[]>> = {
  en: {
    "makaron-ze-szpinakiem": ["Cook the pasta al dente and save half a cup of the cooking water.", "Fry the chopped garlic, add the spinach and let it wilt.", "Pour in the cream, add the pasta and half the Parmesan. Loosen with a little pasta water.", "Season with salt and pepper, then sprinkle with the remaining Parmesan."],
    "kurczak-z-warzywami": ["Cook the rice according to the packet instructions.", "Cut the chicken and vegetables into similar-sized pieces.", "Brown the chicken, add the pepper and peas, then add the tomatoes after 5 minutes.", "Season with your favourite herbs and serve with hot rice."],
    "miska-z-ciecierzyca": ["Drain the chickpeas and fry them with a little olive oil and spices.", "Cut the tomatoes and place them in a bowl with the spinach.", "Add the warm chickpeas and a sauce made from yoghurt and lemon juice.", "Mix just before eating and season to taste."],
    "szakszuka-z-ciecierzyca": ["Fry the chopped onion with cumin until soft.", "Add the chopped tomatoes and chickpeas, then simmer for 10 minutes.", "Make four hollows in the sauce and crack an egg into each one.", "Cover the pan and cook until the whites are set but the yolks remain runny."],
    "chrupiace-zapiekanki": ["Fry the sliced mushrooms until their liquid evaporates.", "Spread the yoghurt on the bread and top with tomatoes and mushrooms.", "Add torn mozzarella and season with pepper.", "Bake for 8–10 minutes at 210°C until the cheese is golden."],
    "losos-z-groszkiem": ["Season the salmon and bake for 15 minutes at 190°C.", "Cook the peas until tender and drain them.", "Mix the yoghurt with lemon juice and chopped dill.", "Serve the salmon with the peas and cold yoghurt sauce."],
  },
  de: {
    "makaron-ze-szpinakiem": ["Koche die Nudeln al dente und hebe eine halbe Tasse Kochwasser auf.", "Brate den gehackten Knoblauch an, gib den Spinat dazu und lass ihn zusammenfallen.", "Gib die Sahne, die Nudeln und die Hälfte des Parmesans dazu. Rühre etwas Nudelwasser unter.", "Würze mit Salz und Pfeffer und streue den restlichen Parmesan darüber."],
    "kurczak-z-warzywami": ["Koche den Reis nach Packungsanweisung.", "Schneide Hähnchen und Gemüse in etwa gleich große Stücke.", "Brate das Hähnchen an, gib Paprika und Erbsen dazu und nach 5 Minuten die Tomaten.", "Würze mit Kräutern nach Geschmack und serviere das Gericht mit heißem Reis."],
    "miska-z-ciecierzyca": ["Gieße die Kichererbsen ab und brate sie mit etwas Olivenöl und Gewürzen an.", "Schneide die Tomaten und gib sie mit dem Spinat in eine Schüssel.", "Gib die warmen Kichererbsen und eine Soße aus Joghurt und Zitronensaft dazu.", "Mische alles erst kurz vor dem Essen und würze nach Geschmack."],
    "szakszuka-z-ciecierzyca": ["Brate die gehackte Zwiebel mit Kreuzkümmel glasig an.", "Gib die gehackten Tomaten und Kichererbsen dazu und lass alles 10 Minuten köcheln.", "Drücke vier Mulden in die Soße und schlage jeweils ein Ei hinein.", "Decke die Pfanne ab und gare die Eier, bis das Eiweiß fest und das Eigelb noch flüssig ist."],
    "chrupiace-zapiekanki": ["Brate die geschnittenen Champignons, bis ihre Flüssigkeit verdampft ist.", "Bestreiche das Brot mit Joghurt und belege es mit Tomaten und Champignons.", "Verteile zerpflückten Mozzarella darauf und würze mit Pfeffer.", "Backe alles 8–10 Minuten bei 210 °C, bis der Käse goldbraun ist."],
    "losos-z-groszkiem": ["Würze den Lachs und backe ihn 15 Minuten bei 190 °C.", "Koche die Erbsen weich und gieße sie ab.", "Verrühre den Joghurt mit Zitronensaft und gehacktem Dill.", "Serviere den Lachs mit Erbsen und kalter Joghurtsoße."],
  },
  fr: {
    "makaron-ze-szpinakiem": ["Faites cuire les pâtes al dente et gardez une demi-tasse d'eau de cuisson.", "Faites revenir l'ail haché, ajoutez les épinards et laissez-les fondre.", "Versez la crème, ajoutez les pâtes et la moitié du parmesan. Détendez avec un peu d'eau de cuisson.", "Salez, poivrez et parsemez du parmesan restant."],
    "kurczak-z-warzywami": ["Faites cuire le riz selon les indications du paquet.", "Coupez le poulet et les légumes en morceaux de taille similaire.", "Faites dorer le poulet, ajoutez le poivron et les petits pois, puis les tomates après 5 minutes.", "Assaisonnez avec vos herbes préférées et servez avec le riz chaud."],
    "miska-z-ciecierzyca": ["Égouttez les pois chiches et faites-les revenir avec un peu d'huile d'olive et des épices.", "Coupez les tomates et disposez-les dans un bol avec les épinards.", "Ajoutez les pois chiches chauds et une sauce au yaourt et au jus de citron.", "Mélangez juste avant de manger et assaisonnez à votre goût."],
    "szakszuka-z-ciecierzyca": ["Faites revenir l'oignon haché avec le cumin jusqu'à ce qu'il soit translucide.", "Ajoutez les tomates coupées et les pois chiches, puis laissez mijoter 10 minutes.", "Creusez quatre puits dans la sauce et cassez un œuf dans chacun.", "Couvrez la poêle et laissez cuire jusqu'à ce que les blancs prennent et que les jaunes restent coulants."],
    "chrupiace-zapiekanki": ["Faites revenir les champignons émincés jusqu'à évaporation de leur eau.", "Tartinez le pain de yaourt et ajoutez les tomates et les champignons.", "Ajoutez la mozzarella déchirée et poivrez.", "Faites cuire 8 à 10 minutes à 210 °C, jusqu'à ce que le fromage dore."],
    "losos-z-groszkiem": ["Assaisonnez le saumon et faites-le cuire 15 minutes au four à 190 °C.", "Faites cuire les petits pois jusqu'à ce qu'ils soient tendres, puis égouttez-les.", "Mélangez le yaourt avec le jus de citron et l'aneth haché.", "Servez le saumon avec les petits pois et la sauce froide au yaourt."],
  },
  es: {
    "makaron-ze-szpinakiem": ["Cuece la pasta al dente y reserva media taza del agua de cocción.", "Sofríe el ajo picado, añade las espinacas y deja que se ablanden.", "Vierte la nata, añade la pasta y la mitad del parmesano. Mezcla con un poco de agua de cocción.", "Sazona con sal y pimienta y espolvorea el resto del parmesano antes de servir."],
    "kurczak-z-warzywami": ["Cuece el arroz según las instrucciones del paquete.", "Corta el pollo y las verduras en trozos de tamaño parecido.", "Dora el pollo, añade el pimiento y los guisantes y, 5 minutos después, los tomates.", "Sazona con tus hierbas favoritas y sirve con el arroz caliente."],
    "miska-z-ciecierzyca": ["Escurre los garbanzos y saltéalos con un poco de aceite de oliva y especias.", "Corta los tomates y ponlos en un bol con las espinacas.", "Añade los garbanzos calientes y una salsa de yogur y zumo de limón.", "Mezcla justo antes de comer y sazona al gusto."],
    "szakszuka-z-ciecierzyca": ["Sofríe la cebolla picada con el comino hasta que esté transparente.", "Añade los tomates cortados y los garbanzos y cocina a fuego lento durante 10 minutos.", "Haz cuatro huecos en la salsa y casca un huevo en cada uno.", "Tapa la sartén y cocina hasta que las claras cuajen y las yemas sigan líquidas."],
    "chrupiace-zapiekanki": ["Saltea los champiñones cortados hasta que se evapore su agua.", "Unta el pan con yogur y coloca encima los tomates y los champiñones.", "Añade la mozzarella desmenuzada y sazona con pimienta.", "Hornea 8–10 minutos a 210 °C, hasta que el queso se dore."],
    "losos-z-groszkiem": ["Sazona el salmón y hornéalo 15 minutos a 190 °C.", "Cuece los guisantes hasta que estén tiernos y escúrrelos.", "Mezcla el yogur con el zumo de limón y el eneldo picado.", "Sirve el salmón con los guisantes y la salsa fría de yogur."],
  },
};

const sampleRecipeCopy: Record<Exclude<Locale, "pl">, Record<string, RecipeCopy & { steps: string[] }>> = {
  en: {
    "Jajecznica z pomidorami": { title: "Scrambled eggs with tomatoes", description: "A simple breakfast with eggs and tomatoes.", ingredients: ["Eggs", "Tomatoes"], steps: ["Cut the tomatoes.", "Beat the eggs and cook them in a frying pan.", "Add the tomatoes and season to taste."] },
    "Makaron z pomidorami": { title: "Pasta with tomatoes", description: "Quick pasta with a simple tomato sauce.", ingredients: ["Pasta", "Tomatoes"], steps: ["Cook the pasta al dente.", "Cut the tomatoes and simmer them in a pan until they form a sauce.", "Combine the pasta with the sauce and season to taste."] },
    "Placki ziemniaczane": { title: "Potato pancakes", description: "Classic crispy potato pancakes.", ingredients: ["Potatoes", "Eggs", "Oil"], steps: ["Grate the potatoes and squeeze out the excess water.", "Mix with the egg and season.", "Fry small pancakes on both sides in hot oil."] },
    "Pieczone jabłka z cynamonem": { title: "Baked apples with cinnamon", description: "A warm dessert with three simple ingredients.", ingredients: ["Apples", "Honey", "Cinnamon"], steps: ["Heat the oven to 180°C and core the apples.", "Mix the honey with the cinnamon and fill the apples.", "Bake for about 20 minutes, until the apples are soft."] },
  },
  de: {
    "Jajecznica z pomidorami": { title: "Rührei mit Tomaten", description: "Ein einfaches Frühstück mit Eiern und Tomaten.", ingredients: ["Eier", "Tomaten"], steps: ["Schneide die Tomaten.", "Verquirle die Eier und brate sie in der Pfanne.", "Gib die Tomaten dazu und würze nach Geschmack."] },
    "Makaron z pomidorami": { title: "Nudeln mit Tomaten", description: "Schnelle Nudeln mit einfacher Tomatensoße.", ingredients: ["Nudeln", "Tomaten"], steps: ["Koche die Nudeln al dente.", "Schneide die Tomaten und lass sie in der Pfanne zu einer Soße einkochen.", "Mische die Nudeln mit der Soße und würze nach Geschmack."] },
    "Placki ziemniaczane": { title: "Kartoffelpuffer", description: "Klassische knusprige Kartoffelpuffer.", ingredients: ["Kartoffeln", "Eier", "Öl"], steps: ["Reibe die Kartoffeln und drücke überschüssiges Wasser aus.", "Vermische sie mit dem Ei und würze die Masse.", "Brate kleine Puffer in heißem Öl von beiden Seiten."] },
    "Pieczone jabłka z cynamonem": { title: "Bratäpfel mit Zimt", description: "Ein warmes Dessert aus drei einfachen Zutaten.", ingredients: ["Äpfel", "Honig", "Zimt"], steps: ["Heize den Ofen auf 180 °C vor und entkerne die Äpfel.", "Mische Honig und Zimt und fülle die Äpfel damit.", "Backe sie etwa 20 Minuten, bis sie weich sind."] },
  },
  fr: {
    "Jajecznica z pomidorami": { title: "Œufs brouillés aux tomates", description: "Un petit-déjeuner simple avec des œufs et des tomates.", ingredients: ["Œufs", "Tomates"], steps: ["Coupez les tomates.", "Battez les œufs et faites-les cuire à la poêle.", "Ajoutez les tomates et assaisonnez à votre goût."] },
    "Makaron z pomidorami": { title: "Pâtes aux tomates", description: "Des pâtes rapides avec une sauce tomate simple.", ingredients: ["Pâtes", "Tomates"], steps: ["Faites cuire les pâtes al dente.", "Coupez les tomates et laissez-les mijoter à la poêle pour obtenir une sauce.", "Mélangez les pâtes avec la sauce et assaisonnez à votre goût."] },
    "Placki ziemniaczane": { title: "Galettes de pommes de terre", description: "Des galettes de pommes de terre classiques et croustillantes.", ingredients: ["Pommes de terre", "Œufs", "Huile"], steps: ["Râpez les pommes de terre et pressez-les pour retirer l'excès d'eau.", "Mélangez-les avec l'œuf et assaisonnez.", "Faites dorer de petites galettes des deux côtés dans l'huile chaude."] },
    "Pieczone jabłka z cynamonem": { title: "Pommes au four à la cannelle", description: "Un dessert chaud avec trois ingrédients simples.", ingredients: ["Pommes", "Miel", "Cannelle"], steps: ["Préchauffez le four à 180 °C et évidez les pommes.", "Mélangez le miel et la cannelle, puis garnissez les pommes.", "Faites cuire environ 20 minutes, jusqu'à ce que les pommes soient tendres."] },
  },
  es: {
    "Jajecznica z pomidorami": { title: "Huevos revueltos con tomate", description: "Un desayuno sencillo con huevos y tomates.", ingredients: ["Huevos", "Tomates"], steps: ["Corta los tomates.", "Bate los huevos y cocínalos en una sartén.", "Añade los tomates y sazona al gusto."] },
    "Makaron z pomidorami": { title: "Pasta con tomate", description: "Pasta rápida con una salsa de tomate sencilla.", ingredients: ["Pasta", "Tomates"], steps: ["Cuece la pasta al dente.", "Corta los tomates y cocínalos en una sartén hasta obtener una salsa.", "Mezcla la pasta con la salsa y sazona al gusto."] },
    "Placki ziemniaczane": { title: "Tortitas de patata", description: "Unas tortitas de patata clásicas y crujientes.", ingredients: ["Patatas", "Huevos", "Aceite"], steps: ["Ralla las patatas y escurre el exceso de agua.", "Mézclalas con el huevo y sazona.", "Fríe pequeñas tortitas por ambos lados en aceite caliente."] },
    "Pieczone jabłka z cynamonem": { title: "Manzanas al horno con canela", description: "Un postre caliente con tres ingredientes sencillos.", ingredients: ["Manzanas", "Miel", "Canela"], steps: ["Calienta el horno a 180 °C y quita el corazón de las manzanas.", "Mezcla la miel con la canela y rellena las manzanas.", "Hornea unos 20 minutos, hasta que estén tiernas."] },
  },
};

const sampleRecipeOriginals: Record<string, { description: string; steps: string[]; ingredients: string[] }> = {
  "Jajecznica z pomidorami": { description: "Proste śniadanie z jajek i pomidorów.", steps: ["Pokrój pomidory.", "Roztrzep jajka i usmaż je na patelni.", "Dodaj pomidory i dopraw do smaku."], ingredients: ["Jajka", "Pomidory"] },
  "Makaron z pomidorami": { description: "Szybki makaron z prostym sosem pomidorowym.", steps: ["Ugotuj makaron al dente.", "Pokrój pomidory i duś je na patelni, aż powstanie sos.", "Połącz makaron z sosem i dopraw do smaku."], ingredients: ["Makaron", "Pomidory"] },
  "Placki ziemniaczane": { description: "Klasyczne chrupiące placki ziemniaczane.", steps: ["Zetrzyj ziemniaki i odciśnij nadmiar wody.", "Wymieszaj z jajkiem i dopraw.", "Smaż małe placki na rozgrzanym oleju z obu stron."], ingredients: ["Ziemniaki", "Jajka", "Olej"] },
  "Pieczone jabłka z cynamonem": { description: "Ciepły deser z trzech prostych składników.", steps: ["Rozgrzej piekarnik do 180°C i wydrąż gniazda nasienne jabłek.", "Wymieszaj miód z cynamonem i napełnij jabłka.", "Piecz około 20 minut, aż jabłka zmiękną."], ingredients: ["Jabłka", "Miód", "Cynamon"] },
};

const productNames: Record<Exclude<Locale, "pl">, string[]> = {
  en: ["Raspberries", "2% milk", "Baby spinach", "Chicken breast", "Natural yoghurt", "Raspberry tomatoes", "Frozen peas", "Atlantic salmon", "Rye bread", "Penne pasta", "Chickpeas"],
  de: ["Himbeeren", "Milch 2 %", "Babyspinat", "Hähnchenbrust", "Naturjoghurt", "Tomaten", "Tiefkühlerbsen", "Atlantischer Lachs", "Roggenbrot", "Penne", "Kichererbsen"],
  fr: ["Framboises", "Lait 2 %", "Jeunes pousses d'épinards", "Blanc de poulet", "Yaourt nature", "Tomates", "Petits pois surgelés", "Saumon atlantique", "Pain de seigle", "Penne", "Pois chiches"],
  es: ["Frambuesas", "Leche 2 %", "Espinacas baby", "Pechuga de pollo", "Yogur natural", "Tomates", "Guisantes congelados", "Salmón atlántico", "Pan de centeno", "Pasta penne", "Garbanzos"],
};

const starterProducts: Record<Exclude<Locale, "pl">, Record<string, string>> = {
  en: { milk: "2% milk", eggs: "Eggs", tomatoes: "Tomatoes", pasta: "Pasta", potatoes: "Potatoes", peas: "Frozen peas" },
  de: { milk: "Milch 2 %", eggs: "Eier", tomatoes: "Tomaten", pasta: "Nudeln", potatoes: "Kartoffeln", peas: "Tiefkühlerbsen" },
  fr: { milk: "Lait 2 %", eggs: "Œufs", tomatoes: "Tomates", pasta: "Pâtes", potatoes: "Pommes de terre", peas: "Petits pois surgelés" },
  es: { milk: "Leche 2 %", eggs: "Huevos", tomatoes: "Tomates", pasta: "Pasta", potatoes: "Patatas", peas: "Guisantes congelados" },
};

const starterShopping: Record<Exclude<Locale, "pl">, Record<string, string>> = {
  en: { bananas: "Bananas", coffee: "Coffee beans", water: "Sparkling water" },
  de: { bananas: "Bananen", coffee: "Kaffeebohnen", water: "Sprudelwasser" },
  fr: { bananas: "Bananes", coffee: "Café en grains", water: "Eau gazeuse" },
  es: { bananas: "Plátanos", coffee: "Café en grano", water: "Agua con gas" },
};

export function localizeDemoRecipe(recipe: Recipe, locale: Locale): Recipe {
  if (locale === "pl") return recipe;
  const original = sampleRecipeOriginals[recipe.title];
  const sampleCopy = "isDemo" in recipe && recipe.isDemo && original?.description === recipe.description
    && original.steps.length === recipe.steps.length && original.steps.every((step, index) => step === recipe.steps[index])
    && original.ingredients.length === recipe.ingredients.length && original.ingredients.every((name, index) => name === recipe.ingredients[index].name)
    ? sampleRecipeCopy[locale][recipe.title]
    : undefined;
  const copy = recipeCopy[locale][recipe.slug] ?? sampleCopy;
  return {
    ...recipe,
    ...(copy ? { title: copy.title, description: copy.description } : {}),
    steps: sampleCopy?.steps ?? recipeSteps[locale][recipe.slug] ?? recipe.steps,
    ingredients: recipe.ingredients.map((ingredient, index) => ({
      ...ingredient,
      name: copy?.ingredients[index] ?? ingredient.name,
      amount: localizeAmount(ingredient.amount, locale),
    })),
  };
}

export function localizeDemoProduct(product: DemoProduct, locale: Locale): DemoProduct {
  if (locale !== "pl" && product.seedKey) {
    return { ...product, name: starterProducts[locale][product.seedKey] ?? product.name };
  }
  if (locale === "pl" || !product.id.startsWith("p")) return product;
  const index = Number(product.id.slice(1));
  return { ...product, name: productNames[locale][index] ?? product.name };
}

export function localizeStarterShoppingItem(item: ShoppingItem, locale: Locale): ShoppingItem {
  return locale !== "pl" && item.seedKey
    ? { ...item, name: starterShopping[locale][item.seedKey] ?? item.name }
    : item;
}
