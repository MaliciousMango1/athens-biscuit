import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Athens Biscuit Rankings",
  description:
    "Rank the best biscuit restaurants in Athens, Georgia. Community-powered leaderboard.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-amber-50 text-gray-900">
        <TRPCReactProvider>
          <nav className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50/95 backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-amber-900">
                <span className="text-2xl">🫓</span>
                <span>Athens Biscuit Rankings</span>
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
            <p>Made with 🫓 in Athens, GA</p>
          </footer>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
