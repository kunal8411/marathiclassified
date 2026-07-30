"use client";

import Link from "next/link";
import { Share2, Flag, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";
import { toast } from "sonner";

interface SellerDetailsProps {
  seller: {
    id: string;
    name: string;
    image?: string;
    memberSince?: string | Date;
    city?: string;
    rating?: number;
    ratingCount?: number;
  };
  adId: string;
  locale: string;
}

export function SellerDetails({ seller, adId, locale }: SellerDetailsProps) {
  const isMarathi = locale === "mr";

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

  const handleChat = () => {
    // Navigate to chat with this seller
    window.location.href = `/${locale}/chat?sellerId=${seller.id}&adId=${adId}`;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/${locale}/ads/${adId}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this listing",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success(isMarathi ? "लिंक कॉपी केली" : "Link copied");
    }
  };

  return (
    <div className="space-y-4">
      {/* Seller Card */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={seller.image} alt={seller.name} />
                <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{seller.name}</h3>
                {seller.rating !== undefined && (
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars value={seller.rating} size="sm" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {seller.rating.toFixed(1)} ({seller.ratingCount || 0})
                    </span>
                  </div>
                )}
                {seller.memberSince && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {isMarathi ? "सदस्य: " : "Member since: "} {memberLabel}
                  </div>
                )}
                {seller.city && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3" />
                    {seller.city}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {/* Message Button - Primary CTA */}
          <Button
            onClick={handleChat}
            className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            size="lg"
          >
            <Mail className="h-4 w-4" />
            {isMarathi ? "विक्रेत्याला संदेश पाठवा" : "Message Seller"}
          </Button>

          {/* View Profile */}
          <Link href={`/${locale}/sellers/${seller.id}`} className="block">
            <Button variant="ghost" className="w-full">
              {isMarathi ? "प्रोफाइल पहा" : "View Profile"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-900 dark:text-blue-200">
            {isMarathi ? "🔒 सुरक्षा सूचना" : "🔒 Safety Tips"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-blue-800 dark:text-blue-300">
          <p>
            • {isMarathi ? "वैयक्तिक माहिती शेअर करू नका" : "Don't share personal info"}
          </p>
          <p>
            • {isMarathi ? "सार्वजनिक ठिकाणी भेटा" : "Meet in public places"}
          </p>
          <p>
            • {isMarathi ? "पैसे देण्यापूर्वी तपासा" : "Verify before payment"}
          </p>
        </CardContent>
      </Card>

      {/* Share & Report */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          {isMarathi ? "शेअर करा" : "Share"}
        </Button>

        <Button
          variant="outline"
          className="flex-1 gap-2 text-red-600 hover:text-red-700"
        >
          <Flag className="h-4 w-4" />
          {isMarathi ? "तक्रार करा" : "Report"}
        </Button>
      </div>
    </div>
  );
}
