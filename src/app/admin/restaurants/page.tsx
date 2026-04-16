"use client";

import { useRef, useState } from "react";
import { api } from "~/trpc/react";

export default function AdminRestaurantsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBiscuitTypes, setSelectedBiscuitTypes] = useState<string[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();
  const restaurants = api.admin.listRestaurants.useQuery();
  const biscuitTypes = api.admin.listBiscuitTypes.useQuery();
  const createMutation = api.admin.createRestaurant.useMutation({
    onSuccess: () => {
      void utils.admin.listRestaurants.invalidate();
      resetForm();
    },
  });
  const updateMutation = api.admin.updateRestaurant.useMutation({
    onSuccess: () => {
      void utils.admin.listRestaurants.invalidate();
      resetForm();
    },
  });
  const deleteMutation = api.admin.deleteRestaurant.useMutation({
    onSuccess: () => void utils.admin.listRestaurants.invalidate(),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setAddress("");
    setWebsite("");
    setNotes("");
    setSelectedBiscuitTypes([]);
  };

  const startEdit = (r: NonNullable<typeof restaurants.data>[number]) => {
    setEditingId(r.id);
    setName(r.name);
    setAddress(r.address ?? "");
    setWebsite(r.website ?? "");
    setNotes(r.notes ?? "");
    setSelectedBiscuitTypes(r.biscuits.map((b) => b.biscuitTypeId));
    setShowForm(true);
    // Scroll the form into view so editing is visually obvious
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name,
        address: address || undefined,
        website: website || undefined,
        notes: notes || undefined,
        biscuitTypeIds: selectedBiscuitTypes,
      });
    } else {
      createMutation.mutate({
        name,
        address: address || undefined,
        website: website || undefined,
        notes: notes || undefined,
        biscuitTypeIds: selectedBiscuitTypes,
      });
    }
  };

  const toggleBiscuitType = (id: string) => {
    setSelectedBiscuitTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-900">Manage Restaurants</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          {showForm ? "Cancel" : "Add Restaurant"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          ref={formRef}
          className="mb-6 scroll-mt-4 rounded-lg border border-amber-200 bg-white p-4"
        >
          <h2 className="mb-3 font-semibold text-amber-900">
            {editingId ? "Edit Restaurant" : "Add Restaurant"}
          </h2>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Restaurant name *"
              className="w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Website URL"
              className="w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows={2}
              className="w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
            {/* Biscuit type checkboxes */}
            {biscuitTypes.data && biscuitTypes.data.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-amber-800">Biscuit types offered:</p>
                <div className="flex flex-wrap gap-2">
                  {biscuitTypes.data.map((bt) => (
                    <label
                      key={bt.id}
                      className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                        selectedBiscuitTypes.includes(bt.id)
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBiscuitTypes.includes(bt.id)}
                        onChange={() => toggleBiscuitType(bt.id)}
                        className="sr-only"
                      />
                      {bt.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!name || createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Restaurant list */}
      <div className="space-y-3">
        {restaurants.data?.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-4"
          >
            <div>
              <h3 className="font-semibold text-amber-900">
                {r.name}
                {!r.active && (
                  <span className="ml-2 text-xs text-red-500">(inactive)</span>
                )}
              </h3>
              {r.address && <p className="text-sm text-amber-600">{r.address}</p>}
              <div className="mt-1 flex flex-wrap gap-1">
                {r.biscuits.map((b) => (
                  <span
                    key={b.biscuitTypeId}
                    className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700"
                  >
                    {b.biscuitType.name}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-amber-500">{r._count.entries} ballot entries</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(r)}
                className="rounded-md border border-amber-300 px-3 py-1 text-sm text-amber-700 hover:bg-amber-50"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this restaurant?")) {
                    deleteMutation.mutate({ id: r.id });
                  }
                }}
                className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {restaurants.data?.length === 0 && (
          <p className="text-center text-amber-600">No restaurants yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}
