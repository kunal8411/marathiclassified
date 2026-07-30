import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type RatingStarsProps = {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  size?: "sm" | "md";
};

export function RatingStars({
  value,
  max = 5,
  className,
  showValue = false,
  size = "md",
}: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`Rating ${clamped} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(clamped);
        const partial = !filled && i < clamped;
        return (
          <Star
            key={i}
            className={cn(
              iconSize,
              filled || partial
                ? "fill-primary text-primary"
                : "fill-muted text-muted-foreground/40",
              partial && "opacity-60",
            )}
          />
        );
      })}
      {showValue ? (
        <span className="ml-1 text-sm text-muted-foreground">
          {clamped.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}
