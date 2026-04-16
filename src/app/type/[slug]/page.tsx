import { notFound } from "next/navigation";
import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";
import { db } from "~/server/db";
import { getLeaderboard } from "~/server/scoring";

export const dynamic = "force-dynamic";

export default async function BiscuitTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Find the biscuit type
  const biscuitType = await db.biscuitType.findUnique({ where: { slug } });
  if (!biscuitType) notFound();

  const leaderboard = await getLeaderboard(db, { biscuitTypeSlug: slug });

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-amber-600 hover:text-amber-800">
        &larr; Back to Leaderboard
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-amber-900">
        Best {biscuitType.name} Biscuits in Athens
      </h1>
      <p className="mb-6 text-amber-600">
        Restaurants ranked by their {biscuitType.name.toLowerCase()} biscuit votes.
      </p>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <Link
            key={entry.restaurantId}
            href={`/restaurant/${entry.restaurantSlug}`}
            className="flex items-center gap-4 rounded-lg border border-amber-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-800">
              {index + 1}
            </div>
            {entry.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.imageUrl}
                alt={entry.restaurantName}
                className="h-12 w-12 flex-shrink-0 rounded-lg border border-amber-200 object-contain bg-white"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 truncate">{entry.restaurantName}</h3>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-amber-900">
                {entry.bayesianScore.toFixed(1)}
              </p>
              <p className="text-xs text-amber-500">
                {entry.voteCount} vote{entry.voteCount !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
        {leaderboard.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-white p-8 text-center">
            <p className="text-amber-600">
              No one has picked {biscuitType.name} as their favorite yet!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
