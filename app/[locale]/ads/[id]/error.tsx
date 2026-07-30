"use client";

import { useEffect } from "react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";

export default function AdError() {
  useEffect(() => {
    console.error("Ad page error");
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <ErrorState title="Listing unavailable" message="This ad may have been removed." />
      <p className="mt-6 text-center text-sm">
        <Link href="../.." className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
