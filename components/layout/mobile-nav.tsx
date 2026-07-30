"use client";

import Link from "next/link";
import {
  Heart,
  Home,
  LogOut,
  MessageSquare,
  PlusCircle,
  Search,
  User,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import type { Locale } from "@/config/site";
import type { SessionUser } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LangSwitcher } from "@/components/shared/lang-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type MobileNavProps = {
  locale?: Locale;
  user?: SessionUser | null;
};

export function MobileNav({
  locale = siteConfig.defaultLocale,
  user = null,
}: MobileNavProps) {
  const prefix = `/${locale}`;

  const links = [
    { href: prefix, label: "Home", icon: Home },
    { href: `${prefix}/search`, label: "Search", icon: Search },
    { href: `${prefix}/sell`, label: "Sell", icon: PlusCircle },
    { href: `${prefix}/favorites`, label: "Favorites", icon: Heart },
    { href: `${prefix}/chat`, label: "Messages", icon: MessageSquare },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <span className="sr-only">Open menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-2rem,320px)]">
        <SheetHeader>
          <SheetTitle>{siteConfig.name}</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              variant="ghost"
              className="justify-start gap-2"
              asChild
            >
              <Link href={href}>
                <Icon className="size-4" />
                {label}
              </Link>
            </Button>
          ))}
          <Separator className="my-2" />
          {user ? (
            <>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <Link href={`${prefix}/profile`}>
                  <User className="size-4" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <Link href={`${prefix}/auth/logout`}>
                  <LogOut className="size-4" />
                  Log out
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href={`${prefix}/login`}>Log in</Link>
            </Button>
          )}
        </nav>
        <div className="mt-8 flex items-center justify-between">
          <LangSwitcher locale={locale} />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
