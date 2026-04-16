"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export function LeaderboardClient() {
  const [activeTypeSlug, setActiveTypeSlug] = useState<string | undefined>(undefined);

  const biscuitTypes = api.biscuitType.list.useQuery();
  const leaderboard = api.leaderboard.ranked.useQuery(
    activeTypeSlug ? { biscuitTypeSlug: activeTypeSlug } : undefined,
  );

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTypeSlug(undefined)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !activeTypeSlug
              ? "bg-amber-600 text-white"
              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
          }`}
        >
          All
        </button>
        {biscuitTypes.data?.map((bt) => (
          <button
            key={bt.id}
            onClick={() => setActiveTypeSlug(bt.slug)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              activeTypeSlug === bt.slug
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            {bt.name}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.data?.map((entry, index) => (
          <Link
            key={entry.restaurantId}
            href={`/restaurant/${entry.restaurantSlug}`}
            className="flex items-center gap-4 rounded-lg border border-amber-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            {/* Rank number */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-800">
              {index + 1}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 truncate">{entry.restaurantName}</h3>
              {entry.address && (
                <p className="text-sm text-amber-600 truncate">{entry.address}</p>
              )}
              {entry.topBiscuitType && (
                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  Top pick: {entry.topBiscuitType}
                </span>
              )}
            </div>

            {/* Score */}
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

        {leaderboard.data?.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-white p-8 text-center">
            <p className="text-amber-600">
              {activeTypeSlug
                ? "No rankings for this biscuit type yet."
                : "No rankings yet. Be the first to rank your favorites!"}
            </p>
            <Link
              href="/rank"
              className="mt-3 inline-block rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Rank Your Top 5
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
