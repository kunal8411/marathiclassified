"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HomeHeroProps {
  locale: string;
}

export function HomeHero({ locale }: HomeHeroProps) {
  const prefix = `/${locale}`;
  const isMarathi = locale === "mr";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-orange-500/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="space-y-8 text-center">
          {/* Badge */}
          <div className="inline-flex">
            <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              {isMarathi ? "ट्रेंडिंग लिस्टिंग्स" : "Trending Listings"}
            </Badge>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {isMarathi ? "तुमचे स्थानिक मराठी" : "Your Local Marathi"}
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {isMarathi ? "मार्केटप्लेस" : "Marketplace"}
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300 sm:text-xl">
              {isMarathi
                ? "गाड्या, फोन, घरं आणि बरेच काही शोधा. सुरक्षित खरेदी-विक्री."
                : "Find cars, phones, homes, and more. Safe & secure buying and selling."}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link href={`${prefix}/search`}>
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                {isMarathi ? "जाहिराती पहा" : "Browse Listings"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`${prefix}/sell`}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {isMarathi ? "विक्री सुरू करा" : "Start Selling"}
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8 text-sm text-slate-400 sm:gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>{isMarathi ? "सुरक्षित व्यवहार" : "Secure Transactions"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span>{isMarathi ? "जलद प्रतिसाद" : "Fast Response"}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <span>{isMarathi ? "सक्रिय समुदाय" : "Active Community"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    </div>
  );
}
