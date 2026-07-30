"use client";

import * as React from "react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        {children}
        <Toaster richColors closeButton position="top-center" />
      </QueryProvider>
    </ThemeProvider>
  );
}
