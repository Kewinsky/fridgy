export type StorageLocation = "Lodówka" | "Zamrażarka" | "Spiżarnia";
export type ProductStatus = "active" | "consumed";

export type DemoProduct = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  storageLocation: StorageLocation;
  estimatedUseBy: string;
  status: ProductStatus;
};

const demoProductSeed: Omit<DemoProduct, "status">[] = [
  { id: "p0", name: "Maliny", quantity: 125, unit: "g", category: "Owoce", storageLocation: "Lodówka", estimatedUseBy: "2026-10-12" },
  { id: "p1", name: "Mleko 2%", quantity: 1, unit: "l", category: "Nabiał", storageLocation: "Lodówka", estimatedUseBy: "2026-10-13" },
  { id: "p2", name: "Szpinak baby", quantity: 150, unit: "g", category: "Warzywa", storageLocation: "Lodówka", estimatedUseBy: "2026-10-14" },
  { id: "p3", name: "Pierś z kurczaka", quantity: 500, unit: "g", category: "Mięso", storageLocation: "Lodówka", estimatedUseBy: "2026-10-15" },
  { id: "p4", name: "Jogurt naturalny", quantity: 2, unit: "szt.", category: "Nabiał", storageLocation: "Lodówka", estimatedUseBy: "2026-10-16" },
  { id: "p5", name: "Pomidory malinowe", quantity: 600, unit: "g", category: "Warzywa", storageLocation: "Lodówka", estimatedUseBy: "2026-10-18" },
  { id: "p6", name: "Mrożony groszek", quantity: 450, unit: "g", category: "Mrożonki", storageLocation: "Zamrażarka", estimatedUseBy: "2026-11-20" },
  { id: "p7", name: "Łosoś atlantycki", quantity: 2, unit: "porcje", category: "Ryby", storageLocation: "Zamrażarka", estimatedUseBy: "2026-11-25" },
  { id: "p8", name: "Chleb żytni", quantity: 1, unit: "szt.", category: "Pieczywo", storageLocation: "Spiżarnia", estimatedUseBy: "2026-10-17" },
  { id: "p9", name: "Makaron penne", quantity: 500, unit: "g", category: "Sypkie", storageLocation: "Spiżarnia", estimatedUseBy: "2027-04-10" },
  { id: "p10", name: "Ciecierzyca", quantity: 1, unit: "puszka", category: "Przetwory", storageLocation: "Spiżarnia", estimatedUseBy: "2027-06-01" },
];

export const demoProducts: DemoProduct[] = demoProductSeed.map((product) => ({ ...product, status: "active" }));

export type FreshnessStatus = "overdue" | "today" | "soon" | "week" | "calm";

const DAY_IN_MS = 86_400_000;

export function getFreshnessStatus(estimatedUseBy: string, now = new Date()): FreshnessStatus {
  const [year, month, day] = estimatedUseBy.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysLeft = Math.round((target - today) / DAY_IN_MS);

  if (daysLeft < 0) return "overdue";
  if (daysLeft === 0) return "today";
  if (daysLeft <= 3) return "soon";
  if (daysLeft <= 7) return "week";
  return "calm";
}

export function formatEstimatedDate(date: string, locale = "pl-PL") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
