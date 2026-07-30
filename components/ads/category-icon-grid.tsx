import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Car,
  Home,
  Laptop,
  Smartphone,
  Sofa,
  Wrench,
} from "lucide-react";

import type { LocalizedString } from "@/types";
import { cn } from "@/lib/utils";

export type CategoryGridItem = {
  id: string;
  slug: string;
  name: LocalizedString;
  icon?: LucideIcon;
  href: string;
  count?: number;
};

const defaultIcons: LucideIcon[] = [
  Car,
  Home,
  Smartphone,
  Laptop,
  Sofa,
  Briefcase,
  Wrench,
];

type CategoryIconGridProps = {
  categories: CategoryGridItem[];
  locale?: "en" | "mr";
  className?: string;
};

export function CategoryIconGrid({
  categories,
  locale = "en",
  className,
}: CategoryIconGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
        className,
      )}
    >
      {categories.map((cat, i) => {
        const Icon = cat.icon ?? defaultIcons[i % defaultIcons.length];
        const label = locale === "mr" ? cat.name.mr : cat.name.en;

        return (
          <Link
            key={cat.id}
            href={cat.href}
            className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-6" />
            </span>
            <span className="text-sm font-medium leading-tight text-foreground">
              {label}
            </span>
            {typeof cat.count === "number" ? (
              <span className="text-xs text-muted-foreground">
                {cat.count.toLocaleString()} ads
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
