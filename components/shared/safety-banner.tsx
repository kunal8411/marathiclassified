import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type SafetyBannerProps = {
  title?: string;
  message?: string;
  className?: string;
};

export function SafetyBanner({
  title = "Stay safe while trading",
  message = "Meet in public places, verify items before paying, and never share OTPs or passwords with buyers or sellers.",
  className,
}: SafetyBannerProps) {
  return (
    <aside
      className={cn(
        "flex gap-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
      <div>
        <p className="font-medium text-accent-foreground">{title}</p>
        <p className="mt-1 text-muted-foreground">{message}</p>
      </div>
    </aside>
  );
}
