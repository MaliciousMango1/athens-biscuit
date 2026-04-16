"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

export default function AdminBallotsPage() {
  const ballots = api.admin.listBallots.useQuery();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-900">Ballots</h1>
        <Link
          href="/admin"
          className="text-sm text-amber-600 hover:text-amber-800"
        >
          &larr; Back to Admin
        </Link>
      </div>

      <p className="mb-4 text-sm text-amber-600">
        {ballots.data?.length ?? 0} total ballot
        {ballots.data?.length === 1 ? "" : "s"}. Most recent first.
      </p>

      <div className="space-y-4">
        {ballots.data?.map((ballot) => (
          <div
            key={ballot.id}
            className="rounded-lg border border-amber-200 bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between text-xs text-amber-500">
              <div>
                <p>
                  <span className="font-semibold text-amber-700">Visitor:</span>{" "}
                  <code className="rounded bg-amber-50 px-1 py-0.5">
                    {ballot.visitorId.slice(0, 8)}…
                  </code>
                </p>
                <p>
                  <span className="font-semibold text-amber-700">IP hash:</span>{" "}
                  <code className="rounded bg-amber-50 px-1 py-0.5">
                    {ballot.ipHash.slice(0, 10)}…
                  </code>
                </p>
              </div>
              <div className="text-right">
                <p>
                  Submitted{" "}
                  {new Date(ballot.createdAt).toLocaleDateString()}{" "}
                  {new Date(ballot.createdAt).toLocaleTimeString()}
                </p>
                {ballot.updatedAt.getTime() !== ballot.createdAt.getTime() && (
                  <p>
                    Updated{" "}
                    {new Date(ballot.updatedAt).toLocaleDateString()}{" "}
                    {new Date(ballot.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <ol className="space-y-1.5">
              {ballot.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-md bg-amber-50 px-3 py-2 text-sm"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                    {entry.position}
                  </span>
                  <span className="font-medium text-amber-900">
                    {entry.restaurant.name}
                  </span>
                  {entry.biscuitType && (
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs text-amber-800">
                      {entry.biscuitType.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}

        {ballots.data?.length === 0 && (
          <p className="rounded-lg border border-amber-200 bg-white p-8 text-center text-amber-600">
            No ballots submitted yet.
          </p>
        )}

        {ballots.isLoading && (
          <p className="text-center text-sm text-amber-500">Loading…</p>
        )}
      </div>
    </div>
  );
}
