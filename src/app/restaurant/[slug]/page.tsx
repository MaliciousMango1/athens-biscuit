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

  // Get this restaurant's position on the leaderboard
  const leaderboard = await getLeaderboard(db);
  const position = leaderboard.findIndex((e) => e.restaurantId === restaurant.id) + 1;
  const entry = leaderboard.find((e) => e.restaurantId === restaurant.id);

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-amber-600 hover:text-amber-800">
        &larr; Back to Leaderboard
      </Link>

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
              <h1 className="text-2xl font-bold text-amber-900">{restaurant.name}</h1>
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
