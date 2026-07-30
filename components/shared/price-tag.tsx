import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type PriceTagProps = {
  amount: number;
  locale?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  negotiable?: boolean;
};

export function PriceTag({
  amount,
  locale = "en-IN",
  className,
  size = "md",
  negotiable,
}: PriceTagProps) {
  const sizeClass = {
    sm: "text-sm font-semibold",
    md: "text-lg font-bold",
    lg: "text-2xl font-bold tracking-tight",
  }[size];

  return (
    <span className={cn("inline-flex items-baseline gap-1.5 text-primary", className)}>
      <span className={sizeClass}>{formatPrice(amount, locale)}</span>
      {negotiable ? (
        <span className="text-xs font-normal text-muted-foreground">
          negotiable
        </span>
      ) : null}
    </span>
  );
}
