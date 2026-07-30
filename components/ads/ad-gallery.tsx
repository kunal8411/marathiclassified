"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { AdImage } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AdGalleryProps = {
  images: AdImage[];
  alt: string;
  className?: string;
};

export function AdGallery({ images, alt, className }: AdGalleryProps) {
  const sorted = React.useMemo(
    () => images.slice().sort((a, b) => a.order - b.order),
    [images],
  );
  const [index, setIndex] = React.useState(0);

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted text-muted-foreground",
          className,
        )}
      >
        No images
      </div>
    );
  }

  const current = sorted[index] ?? sorted[0];
  const hasMultiple = sorted.length > 1;

  const go = (delta: number) => {
    setIndex((i) => (i + delta + sorted.length) % sorted.length);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
        <Image
          src={current.url}
          alt={`${alt} — photo ${index + 1}`}
          fill
          className="object-contain"
          sizes="(max-width:768px) 100vw, 60vw"
          priority
        />
        {hasMultiple ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-md"
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-md"
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <ChevronRight className="size-4" />
            </Button>
            <span className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur">
              {index + 1} / {sorted.length}
            </span>
          </>
        ) : null}
      </div>
      {hasMultiple ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.publicId}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === index
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
