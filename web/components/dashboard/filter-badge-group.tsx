import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FilterBadgeOption<T extends string> = {
  value: T;
  label: string;
  emoji?: string;
  className?: string;
};

export function FilterBadgeGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly FilterBadgeOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex content-start items-start gap-2 overflow-x-auto px-1 py-3 xl:flex-wrap xl:overflow-visible xl:px-3 xl:py-1"
    >
      {options.map((option) => (
        <Badge
          key={option.value}
          variant="outline"
          render={
            <button type="button" aria-pressed={value === option.value} />
          }
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 cursor-pointer rounded-full border-transparent bg-secondary px-2.5 text-xs font-semibold text-primary",
            option.className,
            value === option.value &&
              "ring-2 ring-current ring-offset-1 ring-offset-background",
          )}
        >
          {option.emoji ? (
            <span aria-hidden="true">{option.emoji}</span>
          ) : null}
          {option.label}
        </Badge>
      ))}
    </div>
  );
}
