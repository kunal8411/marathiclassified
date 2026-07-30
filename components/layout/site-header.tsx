"use client";

import Link from "next/link";
import {
  Heart,
  LogOut,
  MessageSquare,
  PlusCircle,
  Search,
  User,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import type { Locale } from "@/config/site";
import type { SessionUser } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LangSwitcher } from "@/components/shared/lang-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";

type SiteHeaderProps = {
  locale?: Locale;
  user?: SessionUser | null;
  className?: string;
};

export function SiteHeader({
  locale = siteConfig.defaultLocale,
  user = null,
  className,
}: SiteHeaderProps) {
  const prefix = `/${locale}`;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <MobileNav locale={locale} user={user} />

        <Link
          href={prefix}
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <span className="hidden size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground sm:flex">
            म
          </span>
          <span className="leading-tight">
            <span className="block text-sm sm:text-base">{siteConfig.name}</span>
            <span className="block text-xs font-normal text-muted-foreground">
              {siteConfig.nameMr}
            </span>
          </span>
        </Link>

        <form
          action={`${prefix}/search`}
          method="get"
          className="mx-auto hidden max-w-md flex-1 md:flex"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder={
                locale === "mr"
                  ? "गाड्या, मोबाईल आणि बरेच काही शोधा…"
                  : "Find cars, mobiles and more…"
              }
              className="rounded-full border-2 pl-9"
              aria-label="Search listings"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            asChild
          >
            <Link href={`${prefix}/search`} aria-label="Search">
              <Search className="size-5" />
            </Link>
          </Button>

          <LangSwitcher locale={locale} className="hidden sm:flex" />

          <ThemeToggle />

          {/* OLX-style SELL button */}
          <Link
            href={`${prefix}/sell`}
            className="group relative hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-[0_0_0_3px] shadow-yellow-400 transition hover:shadow-[0_0_0_3px] hover:shadow-orange-400 dark:bg-slate-100 sm:inline-flex"
          >
            <PlusCircle className="size-4 text-orange-500" />
            {locale === "mr" ? "विका" : "Sell"}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-9 rounded-full p-0"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email ?? user.phone}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`${prefix}/profile`}>
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${prefix}/favorites`}>
                    <Heart className="size-4" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${prefix}/chat`}>
                    <MessageSquare className="size-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`${prefix}/auth/logout`}>
                    <LogOut className="size-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={`${prefix}/login`}>Log in</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="sm:hidden" asChild>
            <Link href={`${prefix}/sell`} aria-label="Sell an item">
              <PlusCircle className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
