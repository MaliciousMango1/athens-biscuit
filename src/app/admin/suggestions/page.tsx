"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function AdminSuggestionsPage() {
  const [filter, setFilter] = useState<string>("pending");

  const utils = api.useUtils();
  const suggestions = api.admin.listSuggestions.useQuery(
    filter ? { status: filter } : undefined,
  );
  const updateStatus = api.admin.updateSuggestionStatus.useMutation({
    onSuccess: () => void utils.admin.listSuggestions.invalidate(),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-amber-900">Community Suggestions</h1>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {["pending", "approved", "rejected", ""].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filter === status
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            {status || "All"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {suggestions.data?.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-amber-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.kind === "restaurant"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {s.kind}
                </span>
                <h3 className="mt-1 font-semibold text-amber-900">{s.name}</h3>
                {s.details && <p className="mt-1 text-sm text-amber-600">{s.details}</p>}
                {s.email && (
                  <p className="mt-1 text-xs text-amber-500">From: {s.email}</p>
                )}
                <p className="mt-1 text-xs text-amber-400">
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              {s.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateStatus.mutate({ id: s.id, status: "approved" })
                    }
                    className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      updateStatus.mutate({ id: s.id, status: "rejected" })
                    }
                    className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              )}
              {s.status !== "pending" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    s.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.status}
                </span>
              )}
            </div>
          </div>
        ))}
        {suggestions.data?.length === 0 && (
          <p className="text-center text-amber-600">No suggestions found.</p>
        )}
      </div>
    </div>
  );
}
