import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import Script from "next/script";

import { TRPCReactProvider } from "~/trpc/react";
import { db } from "~/server/db";
import {
  SETTING_KEY_UMAMI_SCRIPT_URL,
  SETTING_KEY_UMAMI_WEBSITE_ID,
} from "~/server/scoring";

function BiscuitIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="58" rx="44" ry="22" fill="#b45309"/>
      <ellipse cx="50" cy="48" rx="44" ry="22" fill="#d97706"/>
      <ellipse cx="50" cy="42" rx="36" ry="12" fill="#fbbf24" opacity="0.55"/>
      <path d="M6 52 Q50 60 94 52" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.6"/>
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Athens Biscuit Rankings",
  description:
    "Rank the best biscuit restaurants in Athens, Georgia. Community-powered leaderboard.",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let umamiScriptUrl: { value: string } | null = null;
  let umamiWebsiteId: { value: string } | null = null;
  try {
    [umamiScriptUrl, umamiWebsiteId] = await Promise.all([
      db.setting.findUnique({ where: { key: SETTING_KEY_UMAMI_SCRIPT_URL } }),
      db.setting.findUnique({ where: { key: SETTING_KEY_UMAMI_WEBSITE_ID } }),
    ]);
  } catch {
    // DB not available at build time — skip analytics injection
  }

  return (
    <html lang="en" className={`${geist.variable}`}>
      {umamiScriptUrl?.value && umamiWebsiteId?.value && (
        <Script
          src={umamiScriptUrl.value}
          data-website-id={umamiWebsiteId.value}
          strategy="afterInteractive"
        />
      )}
      <body className="min-h-screen bg-amber-50 text-gray-900">
        <TRPCReactProvider>
          <nav className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50/95 backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-amber-900">
                <BiscuitIcon className="h-7 w-7" />
                <span>Athens Biscuit</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/rank"
                  className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                >
                  Rank Your Top 5
                </Link>
                <Link
                  href="/suggest"
                  className="text-sm text-amber-700 hover:text-amber-900"
                >
                  Suggest
                </Link>
              </div>
            </div>
          </nav>
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
          <footer className="border-t border-amber-200 py-6 text-center text-sm text-amber-700">
            <p className="flex items-center justify-center gap-1.5">Made with <BiscuitIcon className="inline-block h-4 w-4" /> in Athens, GA</p>
          </footer>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
