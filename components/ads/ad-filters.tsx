"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

import type { AdCondition, SortOption } from "@/constants";
import { SORT_OPTIONS } from "@/constants";
import type { AdListQuery } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  relevance: "Relevance",
};

export type AdFiltersValue = Pick<
  AdListQuery,
  "minPrice" | "maxPrice" | "city" | "sort" | "condition"
>;

type AdFiltersProps = {
  value: AdFiltersValue;
  onChange: (next: AdFiltersValue) => void;
  priceRange?: [number, number];
  className?: string;
};

export function AdFilters({
  value,
  onChange,
  priceRange = [0, 500_000],
  className,
}: AdFiltersProps) {
  const [localMin, localMax] = priceRange;
  const sliderValue: [number, number] = [
    value.minPrice ?? localMin,
    value.maxPrice ?? localMax,
  ];

  const panel = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="filter-city">City</Label>
        <Input
          id="filter-city"
          placeholder="e.g. Pune, Mumbai"
          value={value.city ?? ""}
          onChange={(e) => onChange({ ...value, city: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-3">
        <Label>Price range (₹)</Label>
        <Slider
          min={localMin}
          max={localMax}
          step={1000}
          value={sliderValue}
          onValueChange={([min, max]) =>
            onChange({ ...value, minPrice: min, maxPrice: max })
          }
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹{sliderValue[0].toLocaleString("en-IN")}</span>
          <span>₹{sliderValue[1].toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Condition</Label>
        <Select
          value={value.condition ?? "all"}
          onValueChange={(v) =>
            onChange({
              ...value,
              condition: v === "all" ? undefined : (v as AdCondition),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select
          value={value.sort ?? "newest"}
          onValueChange={(v) => onChange({ ...value, sort: v as SortOption })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {SORT_LABELS[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() =>
          onChange({
            sort: value.sort,
          })
        }
      >
        Clear filters
      </Button>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden w-64 shrink-0 space-y-4 rounded-xl border bg-card p-4 lg:block",
          className,
        )}
      >
        <p className="text-sm font-semibold">Filters</p>
        <Separator />
        {panel}
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2 lg:hidden">
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{panel}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
