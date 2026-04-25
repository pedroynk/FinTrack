"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthYearPickerProps {
  value: string; // YYYY-MM-01
  onChange: (value: string) => void;
}

const months = [
  "Jan", "Fev", "Mar", "Abr",
  "Mai", "Jun", "Jul", "Ago",
  "Set", "Out", "Nov", "Dez",
];

export function MonthYearPicker({ value, onChange }: MonthYearPickerProps) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();

  const selectedMonth = date.getMonth();
  const selectedYear = date.getFullYear();

  function changeYear(direction: "prev" | "next") {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1;
    onChange(`${newYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`);
  }

  function selectMonth(monthIndex: number) {
    onChange(`${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-01`);
  }

  return (
    <div className="rounded-lg border bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => changeYear("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-base font-semibold">{selectedYear}</div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => changeYear("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => {
          const active = index === selectedMonth;

          return (
            <Button
              key={month}
              type="button"
              variant={active ? "default" : "outline"}
              onClick={() => selectMonth(index)}
              className="w-full"
            >
              {month}
            </Button>
          );
        })}
      </div>
    </div>
  );
}