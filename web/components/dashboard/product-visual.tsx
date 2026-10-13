import {
  AppleIcon,
  BeefIcon,
  CarrotIcon,
  MilkIcon,
  PackageIcon,
  SnowflakeIcon,
  WheatIcon,
} from "lucide-react";

export function ProductVisual({ category }: { category: string }) {
  const Icon =
    category === "Nabiał"
      ? MilkIcon
      : category === "Mięso" || category === "Ryby"
        ? BeefIcon
        : category === "Warzywa"
          ? CarrotIcon
          : category === "Owoce"
            ? AppleIcon
            : category === "Pieczywo" || category === "Sypkie"
              ? WheatIcon
              : category === "Mrożonki"
                ? SnowflakeIcon
                : PackageIcon;

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}
