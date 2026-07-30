import Link from "next/link";
import { Calendar, MapPin, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";

export type SellerCardData = {
  id: string;
  name: string;
  image?: string;
  memberSince?: string | Date;
  city?: string;
  rating?: number;
  ratingCount?: number;
  profileHref: string;
  messageHref?: string;
};

type SellerCardProps = {
  seller: SellerCardData;
  className?: string;
  showMessage?: boolean;
};

export function SellerCard({
  seller,
  className,
  showMessage = true,
}: SellerCardProps) {
  const initials = seller.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberLabel =
    seller.memberSince instanceof Date
      ? seller.memberSince.toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        })
      : seller.memberSince;

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="size-14">
          <AvatarImage src={seller.image} alt={seller.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">
            <Link
              href={seller.profileHref}
              className="hover:text-primary hover:underline"
            >
              {seller.name}
            </Link>
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
            {seller.city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {seller.city}
              </span>
            ) : null}
            {memberLabel ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" />
                Member since {memberLabel}
              </span>
            ) : null}
          </CardDescription>
        </div>
      </CardHeader>
      {(seller.rating != null || seller.ratingCount != null) && (
        <CardContent className="pt-0">
          <RatingStars
            value={seller.rating ?? 0}
            showValue
            size="sm"
          />
          {seller.ratingCount != null ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {seller.ratingCount} reviews
            </p>
          ) : null}
        </CardContent>
      )}
      {showMessage && seller.messageHref ? (
        <CardFooter>
          <Button className="w-full gap-2" asChild>
            <Link href={seller.messageHref}>
              <MessageSquare className="size-4" />
              Message seller
            </Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
