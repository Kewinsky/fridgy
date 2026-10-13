import {
  LayoutGridIcon,
  PackageIcon,
  RefrigeratorIcon,
  SnowflakeIcon,
} from "lucide-react";

import type { StorageLocation } from "@/lib/demo-data";

const icons = {
  Wszystkie: LayoutGridIcon,
  Lodówka: RefrigeratorIcon,
  Zamrażarka: SnowflakeIcon,
  Spiżarnia: PackageIcon,
} as const;

export function StorageLocationIcon({
  location,
  className,
}: {
  location: StorageLocation | "Wszystkie";
  className?: string;
}) {
  const Icon = icons[location];
  return <Icon className={className} aria-hidden="true" />;
}
