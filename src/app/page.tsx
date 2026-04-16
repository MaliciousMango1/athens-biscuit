import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";
import { LeaderboardClient } from "~/components/LeaderboardClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Prefetch data on the server
  void api.leaderboard.ranked.prefetch();
  void api.biscuitType.list.prefetch();

  return (
    <HydrateClient>
      <div>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-amber-900 md:text-4xl">
            Best Biscuits in Athens, GA
          </h1>
          <p className="mt-2 text-amber-700">
            Community-ranked biscuit restaurants. Drag and drop your top 5!
          </p>
          <Link
            href="/rank"
            className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Rank Your Top 5
          </Link>
          <p className="mt-3 text-xs text-amber-500">
            For fun only — anonymous rankings can be gamed.{" "}
            <Link href="/about" className="underline hover:text-amber-700">
              How this works
            </Link>
          </p>
        </div>
        <LeaderboardClient />
      </div>
    </HydrateClient>
  );
}
