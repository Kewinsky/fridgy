import type { StorageLocation } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const storageLocationEmojis = {
  Lodówka: "🧊",
  Zamrażarka: "❄️",
  Spiżarnia: "🥫",
} as const;

export const storageLocationMessageKeys: Record<StorageLocation, string> = {
  Lodówka: "fridge",
  Zamrażarka: "freezer",
  Spiżarnia: "pantry",
};

export function StorageLocationIcon({
  location,
  className,
}: {
  location: StorageLocation;
  className?: string;
}) {
  return (
    <span className={cn("text-base leading-none", className)} aria-hidden="true">
      {storageLocationEmojis[location]}
    </span>
  );
}
