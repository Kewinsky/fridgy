"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const productUnits = ["szt.", "g", "kg", "ml", "l", "opak.", "puszka", "porcje", "kromki"] as const;

export function ProductUnitSelect({ id, value, onValueChange, compact = false, invalid = false }: { id: string; value: string; onValueChange: (value: string) => void; compact?: boolean; invalid?: boolean }) {
  const options = value && !productUnits.some((unit) => unit === value) ? [value, ...productUnits] : productUnits;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        className={cn("h-11! min-h-11", compact ? "w-auto" : "w-full")}
        render={
          <Button type="button" variant="outline" aria-invalid={invalid} className={cn("h-11! min-h-11 justify-between px-3 font-normal aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20", compact ? "w-auto" : "w-full")}>
            <span className="truncate">{value}</span>
            <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
        {options.map((unit) => (
          <DropdownMenuItem key={unit} onClick={() => onValueChange(unit)}>
            <span className="flex-1">{unit}</span>
            {value === unit ? <CheckIcon aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
