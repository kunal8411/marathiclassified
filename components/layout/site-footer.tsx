import Link from "next/link";

import { siteConfig } from "@/config/site";
import type { Locale } from "@/config/site";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type SiteFooterProps = {
  locale?: Locale;
  className?: string;
};

export function SiteFooter({
  locale = siteConfig.defaultLocale,
  className,
}: SiteFooterProps) {
  const prefix = `/${locale}`;
  const year = new Date().getFullYear();

  const columns = [
    {
      title: "Marketplace",
      links: [
        { href: `${prefix}/categories`, label: "Categories" },
        { href: `${prefix}/search`, label: "Browse ads" },
        { href: `${prefix}/sell`, label: "Post an ad" },
      ],
    },
    {
      title: "Account",
      links: [
        { href: `${prefix}/profile`, label: "Profile" },
        { href: `${prefix}/favorites`, label: "Favorites" },
        { href: `${prefix}/chat`, label: "Messages" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: `${prefix}/help`, label: "Help centre" },
        { href: `${prefix}/safety`, label: "Safety tips" },
        { href: `${prefix}/contact`, label: "Contact us" },
      ],
    },
  ];

  return (
    <footer className={cn("border-t bg-muted/30", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {siteConfig.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {locale === "mr"
                ? siteConfig.descriptionMr
                : siteConfig.description}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-foreground">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Made for Maharashtra.
          </p>
          <div className="flex gap-4">
            <Link href={`${prefix}/privacy`} className="hover:text-foreground">
              Privacy
            </Link>
            <Link href={`${prefix}/terms`} className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
