import Link from "next/link";

import { siteConfig } from "@/config/site";

/**
 * Root App Router 404. Presence of this file stops Next.js from falling back
 * to the Pages Router /_error → /404 export path (which throws
 * "<Html> should not be imported outside of pages/_document").
 */
export default function RootNotFound() {
  const home = `/${siteConfig.defaultLocale}`;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
        404
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Page not found
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href={home}
        className="mt-2 inline-flex rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
      >
        Back to home
      </Link>
    </div>
  );
}
