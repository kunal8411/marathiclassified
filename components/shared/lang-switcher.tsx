import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Locale } from "@/config/site";

type LangSwitcherProps = {
  locale: Locale;
  className?: string;
  variant?: "inline" | "pills";
};

export function LangSwitcher({
  locale,
  className,
  variant = "pills",
}: LangSwitcherProps) {
  const locales: { code: Locale; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "mr", label: "मर" },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        variant === "pills" &&
          "rounded-md border bg-muted/50 p-0.5 text-xs font-medium",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {locales.map(({ code, label }) => {
        const active = locale === code;
        return (
          <Link
            key={code}
            href={`/${code}`}
            className={cn(
              "rounded px-2 py-1 transition-colors",
              variant === "pills" &&
                (active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"),
              variant === "inline" &&
                (active
                  ? "text-primary underline underline-offset-4"
                  : "text-muted-foreground hover:text-foreground"),
            )}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
