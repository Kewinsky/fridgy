"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const weekDays = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

export function DatePicker({
  id,
  value,
  onValueChange,
}: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const selectedDate = value ? parseISO(value) : undefined;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selectedDate ?? new Date());
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        render={
          <Button type="button" variant="outline" className="h-11 w-full justify-start px-3 font-normal">
            <CalendarIcon aria-hidden="true" />
            {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: pl }) : "Wybierz datę"}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-3">
        <div className="mb-3 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon-lg" aria-label="Poprzedni miesiąc" onClick={() => setMonth((current) => subMonths(current, 1))}>
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          <p className="text-sm font-bold capitalize">{format(month, "LLLL yyyy", { locale: pl })}</p>
          <Button type="button" variant="ghost" size="icon-lg" aria-label="Następny miesiąc" onClick={() => setMonth((current) => addMonths(current, 1))}>
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Kalendarz">
          {weekDays.map((day) => <span key={day} className="flex size-9 items-center justify-center text-xs font-semibold text-muted-foreground">{day}</span>)}
          {days.map((day) => {
            const selected = selectedDate ? isSameDay(day, selectedDate) : false;
            return (
              <Button
                key={day.toISOString()}
                type="button"
                variant={selected ? "default" : "ghost"}
                size="icon-lg"
                className={cn("size-9 text-xs", !isSameMonth(day, month) && "text-muted-foreground opacity-45")}
                aria-label={format(day, "d MMMM yyyy", { locale: pl })}
                aria-pressed={selected}
                onClick={() => {
                  onValueChange(format(day, "yyyy-MM-dd"));
                  setMonth(day);
                  setOpen(false);
                }}
              >
                {format(day, "d")}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
