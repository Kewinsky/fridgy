import { productCategoryAppearance } from "@/components/dashboard/product-category-options";
import { cn } from "@/lib/utils";

export function ProductVisual({ category }: { category: string }) {
  const appearance =
    productCategoryAppearance[category] ?? productCategoryAppearance.Wszystkie;

  return (
    <span
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-lg border text-xl leading-none",
        appearance.className,
      )}
      aria-hidden="true"
    >
      {appearance.emoji}
    </span>
  );
}
