"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

type SavedKey = "bayesian" | "popularity" | "umami" | null;

export default function AdminSettingsPage() {
  const utils = api.useUtils();
  const settings = api.admin.getSettings.useQuery();

  const [bayesianValue, setBayesianValue] = useState<string>("");
  const [popularityValue, setPopularityValue] = useState<string>("");
  const [umamiScriptUrl, setUmamiScriptUrl] = useState<string>("");
  const [umamiWebsiteId, setUmamiWebsiteId] = useState<string>("");
  const [savedKey, setSavedKey] = useState<SavedKey>(null);

  const flashSaved = (key: Exclude<SavedKey, null>) => {
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);
  };

  const updateBayesian = api.admin.updateBayesianConfidence.useMutation({
    onSuccess: () => {
      void utils.admin.getSettings.invalidate();
      void utils.leaderboard.ranked.invalidate();
      flashSaved("bayesian");
    },
  });
  const updatePopularity = api.admin.updatePopularityWeight.useMutation({
    onSuccess: () => {
      void utils.admin.getSettings.invalidate();
      void utils.leaderboard.ranked.invalidate();
      flashSaved("popularity");
    },
  });
  const updateUmami = api.admin.updateUmamiSettings.useMutation({
    onSuccess: () => {
      void utils.admin.getSettings.invalidate();
      flashSaved("umami");
    },
  });

  useEffect(() => {
    if (settings.data) {
      if (bayesianValue === "") {
        setBayesianValue(String(settings.data.bayesianConfidence));
      }
      if (popularityValue === "") {
        setPopularityValue(String(settings.data.popularityWeight));
      }
      if (umamiScriptUrl === "") setUmamiScriptUrl(settings.data.umamiScriptUrl);
      if (umamiWebsiteId === "") setUmamiWebsiteId(settings.data.umamiWebsiteId);
    }
  }, [settings.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveBayesian = () => {
    const parsed = parseFloat(bayesianValue);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    updateBayesian.mutate({ value: parsed });
  };

  const savePopularity = () => {
    const parsed = parseFloat(popularityValue);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    updatePopularity.mutate({ value: parsed });
  };

  const saveUmami = () => {
    updateUmami.mutate({
      scriptUrl: umamiScriptUrl,
      websiteId: umamiWebsiteId,
    });
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

      <div className="space-y-6">
        {/* Bayesian confidence */}
        <div className="rounded-lg border border-amber-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-amber-900">
            Bayesian Confidence (m)
          </h2>
          <p className="mt-1 text-sm text-amber-700">
            Controls how much weight is given to a restaurant&apos;s own
            votes vs. the global average. Higher = more skeptical of
            low-sample restaurants.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-amber-600">
            <li>
              <strong>m = 2:</strong> early-stage; a single vote already
              carries weight
            </li>
            <li>
              <strong>m = 5:</strong> balanced default
            </li>
            <li>
              <strong>m = 10:</strong> conservative; small-sample
              restaurants mostly show the community average
            </li>
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              step="0.5"
              min="0.1"
              value={bayesianValue}
              onChange={(e) => setBayesianValue(e.target.value)}
              className="w-28 rounded-md border border-amber-300 px-3 py-2 text-amber-900 focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={saveBayesian}
              disabled={updateBayesian.isPending || bayesianValue === ""}
              className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {updateBayesian.isPending ? "Saving..." : "Save"}
            </button>
            {savedKey === "bayesian" && (
              <span className="text-sm font-medium text-green-700">
                ✓ Saved
              </span>
            )}
          </div>
          <p className="mt-4 text-xs text-amber-500">
            Current: <strong>{settings.data?.bayesianConfidence}</strong> ·
            Code default: {settings.data?.bayesianConfidenceDefault}
          </p>
        </div>

        {/* Popularity weight */}
        <div className="rounded-lg border border-amber-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-amber-900">
            Popularity Weight
          </h2>
          <p className="mt-1 text-sm text-amber-700">
            Adds{" "}
            <code className="rounded bg-amber-50 px-1 py-0.5">
              weight × log₁₀(votes + 1)
            </code>{" "}
            to each restaurant&apos;s score. Rewards being on many top-5
            ballots regardless of where they placed.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-amber-600">
            <li>
              <strong>0.0:</strong> disabled — pure ranking quality only
            </li>
            <li>
              <strong>0.3:</strong> subtle popularity nudge
            </li>
            <li>
              <strong>0.5:</strong> default — meaningful but not dominant
            </li>
            <li>
              <strong>1.0+:</strong> popularity-dominated
            </li>
          </ul>
          <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
            <p className="font-semibold">Reference bonuses at weight 0.5:</p>
            <p>
              1 vote → +0.15 · 10 votes → +0.52 · 30 votes → +0.75 · 100
              votes → +1.00
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              min="0"
              value={popularityValue}
              onChange={(e) => setPopularityValue(e.target.value)}
              className="w-28 rounded-md border border-amber-300 px-3 py-2 text-amber-900 focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={savePopularity}
              disabled={updatePopularity.isPending || popularityValue === ""}
              className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {updatePopularity.isPending ? "Saving..." : "Save"}
            </button>
            {savedKey === "popularity" && (
              <span className="text-sm font-medium text-green-700">
                ✓ Saved
              </span>
            )}
          </div>
          <p className="mt-4 text-xs text-amber-500">
            Current: <strong>{settings.data?.popularityWeight}</strong> ·
            Code default: {settings.data?.popularityWeightDefault}
          </p>
        </div>

        {/* Umami analytics */}
        <div className="rounded-lg border border-amber-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-amber-900">
            Umami Analytics
          </h2>
          <p className="mt-1 text-sm text-amber-700">
            Optional. Inject an Umami tracking script into every page. Leave
            both fields blank to disable.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-amber-700">
                Script URL
              </label>
              <input
                type="text"
                value={umamiScriptUrl}
                onChange={(e) => setUmamiScriptUrl(e.target.value)}
                placeholder="https://cloud.umami.is/script.js"
                className="w-full rounded-md border border-amber-300 px-3 py-2 text-amber-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-amber-700">
                Website ID
              </label>
              <input
                type="text"
                value={umamiWebsiteId}
                onChange={(e) => setUmamiWebsiteId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full rounded-md border border-amber-300 px-3 py-2 text-amber-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveUmami}
                disabled={updateUmami.isPending}
                className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {updateUmami.isPending ? "Saving..." : "Save"}
              </button>
              {savedKey === "umami" && (
                <span className="text-sm font-medium text-green-700">
                  ✓ Saved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
