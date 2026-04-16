"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function AdminBiscuitTypesPage() {
  const [name, setName] = useState("");

  const utils = api.useUtils();
  const biscuitTypes = api.admin.listBiscuitTypes.useQuery();
  const createMutation = api.admin.createBiscuitType.useMutation({
    onSuccess: () => {
      void utils.admin.listBiscuitTypes.invalidate();
      setName("");
    },
  });
  const deleteMutation = api.admin.deleteBiscuitType.useMutation({
    onSuccess: () => void utils.admin.listBiscuitTypes.invalidate(),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-amber-900">Manage Biscuit Types</h1>

      {/* Add form */}
      <div className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              createMutation.mutate({ name: name.trim() });
            }
          }}
          placeholder="New biscuit type (e.g., Sausage, Cathead, Chicken)"
          className="flex-1 rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
        />
        <button
          onClick={() => name.trim() && createMutation.mutate({ name: name.trim() })}
          disabled={!name.trim() || createMutation.isPending}
          className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {biscuitTypes.data?.map((bt) => (
          <div
            key={bt.id}
            className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-3"
          >
            <div>
              <span className="font-medium text-amber-900">{bt.name}</span>
              <span className="ml-2 text-sm text-amber-500">
                ({bt._count.restaurants} restaurant{bt._count.restaurants !== 1 ? "s" : ""})
              </span>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete "${bt.name}"?`)) {
                  deleteMutation.mutate({ id: bt.id });
                }
              }}
              className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        ))}
        {biscuitTypes.data?.length === 0 && (
          <p className="text-center text-amber-600">
            No biscuit types yet. Add common ones like Sausage, Cathead, Chicken, Bacon Egg Cheese, etc.
          </p>
        )}
      </div>
    </div>
  );
}
