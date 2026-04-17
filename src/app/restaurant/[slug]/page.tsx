import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/server";
import { getLeaderboard } from "~/server/scoring";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await api.restaurant.getBySlug({ slug });

  if (!restaurant) notFound();

  // Load leaderboard and detailed stats in parallel
  const [leaderboard, stats] = await Promise.all([
    getLeaderboard(db),
    api.restaurant.getStatsBySlug({ slug }),
  ]);

  const position =
    leaderboard.findIndex((e) => e.restaurantId === restaurant.id) + 1;
  const entry = leaderboard.find((e) => e.restaurantId === restaurant.id);

  const maxPositionCount =
    stats && stats.positionCounts
      ? Math.max(...Object.values(stats.positionCounts))
      : 0;

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-amber-600 hover:text-amber-800"
      >
        &larr; Back to Leaderboard
      </Link>

      {/* Header card */}
      <div className="rounded-lg border border-amber-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {restaurant.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="h-20 w-20 flex-shrink-0 rounded-lg border border-amber-200 object-contain bg-white"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-amber-900">
                {restaurant.name}
              </h1>
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-amber-500 hover:text-amber-700"
                >
                  Visit Website &rarr;
                </a>
              )}
            </div>
          </div>
          {position > 0 && (
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-900">#{position}</p>
              <p className="text-sm text-amber-600">
                Score: {entry?.bayesianScore.toFixed(1)}
              </p>
              <p className="text-xs text-amber-500">
                {entry?.voteCount} vote{entry?.voteCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {restaurant.notes && (
          <p className="mt-4 text-sm text-amber-700">{restaurant.notes}</p>
        )}

        {/* Biscuit types offered */}
        {restaurant.biscuits.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 font-semibold text-amber-800">Biscuit Types</h2>
            <div className="flex flex-wrap gap-2">
              {restaurant.biscuits.map((b) => (
                <Link
                  key={b.biscuitTypeId}
                  href={`/type/${b.biscuitType.slug}`}
                  className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700 hover:bg-amber-200"
                >
                  {b.biscuitType.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && stats.voteCount > 0 && (
        <>
          {/* Summary numbers */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-amber-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-amber-900">
                {entry?.bayesianScore.toFixed(2) ?? "—"}
              </p>
              <p className="text-xs text-amber-600">Leaderboard Score</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-amber-900">
                {stats.rawAverage.toFixed(2)}
              </p>
              <p className="text-xs text-amber-600">Raw Average</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-amber-900">
                {stats.voteCount}
              </p>
              <p className="text-xs text-amber-600">
                Vote{stats.voteCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Position distribution */}
          <div className="mt-6 rounded-lg border border-amber-200 bg-white p-6">
            <h2 className="mb-1 font-semibold text-amber-800">
              Rank Distribution
            </h2>
            <p className="mb-4 text-xs text-amber-500">
              How many voters put this restaurant at each position.
            </p>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((pos) => {
                const count = stats.positionCounts[pos] ?? 0;
                const pct =
                  maxPositionCount > 0
                    ? Math.round((count / maxPositionCount) * 100)
                    : 0;
                return (
                  <div key={pos} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                      #{pos}
                    </span>
                    <div className="relative flex-1 h-6 rounded-md bg-amber-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-semibold text-amber-800">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Biscuit type breakdown */}
          {stats.biscuitTypeBreakdown.length > 0 && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-white p-6">
              <h2 className="mb-1 font-semibold text-amber-800">
                Favorite Biscuit Picks
              </h2>
              <p className="mb-4 text-xs text-amber-500">
                What voters picked as their favorite biscuit type here.
              </p>
              <div className="space-y-2">
                {stats.biscuitTypeBreakdown.map((bt) => {
                  const maxCount = stats.biscuitTypeBreakdown[0]?.count ?? 1;
                  const pct = Math.round((bt.count / maxCount) * 100);
                  return (
                    <Link
                      key={bt.id}
                      href={`/type/${bt.slug}`}
                      className="flex items-center gap-3 rounded-md p-1 hover:bg-amber-50"
                    >
                      <span className="w-32 flex-shrink-0 truncate text-sm text-amber-800">
                        {bt.name}
                      </span>
                      <div className="relative flex-1 h-5 rounded-md bg-amber-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-amber-800">
                        {bt.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {stats && stats.voteCount === 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-white p-8 text-center">
          <p className="text-amber-600">No votes yet. Be the first!</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/rank"
          className="inline-block rounded-full bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700"
        >
          Rank Your Favorites
        </Link>
      </div>
    </div>
  );
}
