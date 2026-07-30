import { notFound } from "next/navigation";

/**
 * Catch-all for unknown routes under a locale (e.g. /en/does-not-exist).
 * Forces the App Router [locale]/not-found.tsx instead of a blank page.
 */
export default function CatchAllPage() {
  notFound();
}
