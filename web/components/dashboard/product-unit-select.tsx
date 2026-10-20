"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const productUnits = ["szt.", "g", "kg", "ml", "l", "opak.", "puszka", "porcje", "kromki"] as const;

export function ProductUnitSelect({ id, value, onValueChange }: { id: string; value: string; onValueChange: (value: string) => void }) {
  const options = value && !productUnits.some((unit) => unit === value) ? [value, ...productUnits] : productUnits;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        className="h-11! min-h-11 w-full"
        render={
          <Button type="button" variant="outline" className="h-11! min-h-11 w-full justify-between px-3 font-normal">
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
