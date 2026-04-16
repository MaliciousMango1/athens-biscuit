"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function SuggestPage() {
  const [kind, setKind] = useState<"restaurant" | "biscuit">("restaurant");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = api.suggestion.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setName("");
      setDetails("");
      setEmail("");
    },
  });

  if (submitted) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🙏</div>
          <h1 className="text-xl font-bold text-amber-900">Thanks for the suggestion!</h1>
          <p className="mt-2 text-amber-600">We&apos;ll review it soon.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-bold text-amber-900">Suggest an Addition</h1>
      <p className="mb-6 text-amber-600">
        Know a biscuit spot we&apos;re missing? Or a biscuit type we should add?
      </p>

      <div className="rounded-lg border border-amber-200 bg-white p-6">
        {/* Kind toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setKind("restaurant")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              kind === "restaurant"
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            Restaurant
          </button>
          <button
            onClick={() => setKind("biscuit")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              kind === "biscuit"
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            Biscuit Type
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === "restaurant" ? "Restaurant name" : "Biscuit type name"}
            className="w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
          />
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Any details? (address, why it's great, etc.)"
            rows={3}
            className="w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email (optional, in case we have questions)"
            type="email"
            className="w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={() =>
              mutation.mutate({
                kind,
                name: name.trim(),
                details: details.trim() || undefined,
                email: email.trim() || undefined,
              })
            }
            disabled={!name.trim() || mutation.isPending}
            className="w-full rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Submitting..." : "Submit Suggestion"}
          </button>
          {mutation.error && (
            <p className="text-sm text-red-600">{mutation.error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
