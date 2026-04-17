"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

export default function AdminSettingsPage() {
  const utils = api.useUtils();
  const settings = api.admin.getSettings.useQuery();
  const updateBayesian = api.admin.updateBayesianConfidence.useMutation({
    onSuccess: () => {
      void utils.admin.getSettings.invalidate();
      void utils.leaderboard.ranked.invalidate();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    },
  });

  const [value, setValue] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  // Seed the input once data loads
  useEffect(() => {
    if (settings.data && value === "") {
      setValue(String(settings.data.bayesianConfidence));
    }
  }, [settings.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    updateBayesian.mutate({ value: parsed });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-900">Settings</h1>
        <Link
          href="/admin"
          className="text-sm text-amber-600 hover:text-amber-800"
        >
          &larr; Back to Admin
        </Link>
      </div>

      <div className="rounded-lg border border-amber-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-amber-900">
          Bayesian Confidence (m)
        </h2>
        <p className="mt-1 text-sm text-amber-700">
          Controls how much weight is given to a restaurant&apos;s own votes
          vs. the global average. Higher = more skeptical of low-sample
          restaurants, lower = faster-moving early leaderboard.
        </p>

        <ul className="mt-3 space-y-1 text-xs text-amber-600">
          <li>
            <strong>m = 2:</strong> early-stage; a single vote already
            carries weight
          </li>
          <li>
            <strong>m = 5:</strong> balanced default; needs ~10+ votes to
            trust a restaurant&apos;s raw average
          </li>
          <li>
            <strong>m = 10:</strong> conservative; small-sample restaurants
            mostly show the community average
          </li>
        </ul>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            step="0.5"
            min="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-28 rounded-md border border-amber-300 px-3 py-2 text-amber-900 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={updateBayesian.isPending || value === ""}
            className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {updateBayesian.isPending ? "Saving..." : "Save"}
          </button>
          {status === "saved" && (
            <span className="text-sm font-medium text-green-700">
              ✓ Saved
            </span>
          )}
        </div>

        <p className="mt-4 text-xs text-amber-500">
          Current value: <strong>{settings.data?.bayesianConfidence}</strong>{" "}
          · Default: {settings.data?.bayesianConfidenceDefault} · Leaderboard
          recomputes on next page load.
        </p>
      </div>
    </div>
  );
}
