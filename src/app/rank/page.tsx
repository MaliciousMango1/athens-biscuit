"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "~/trpc/react";

interface RankedRestaurant {
  id: string;
  name: string;
  slug: string;
  selectedBiscuitTypeId: string | null;
  biscuitTypes: { id: string; name: string }[];
}

// Sortable ranked item component
function SortableRankedItem({
  item,
  position,
  onRemove,
  onBiscuitTypeChange,
}: {
  item: RankedRestaurant;
  position: number;
  onRemove: () => void;
  onBiscuitTypeChange: (biscuitTypeId: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border-2 border-amber-300 bg-white p-3"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex h-8 w-8 flex-shrink-0 cursor-grab items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white active:cursor-grabbing"
      >
        {position}
      </div>

      {/* Restaurant info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-amber-900">{item.name}</p>
        {/* Biscuit type dropdown */}
        {item.biscuitTypes.length > 0 && (
          <select
            value={item.selectedBiscuitTypeId ?? ""}
            onChange={(e) => onBiscuitTypeChange(e.target.value || null)}
            className="mt-1 w-full rounded border border-amber-200 px-2 py-1 text-sm text-amber-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="">Pick your fav biscuit here (optional)</option>
            {item.biscuitTypes.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-amber-400 hover:bg-red-50 hover:text-red-500"
      >
        ✕
      </button>
    </div>
  );
}

export default function RankPage() {
  const [ranked, setRanked] = useState<RankedRestaurant[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const restaurants = api.restaurant.list.useQuery();
  const myBallot = api.ballot.getMyBallot.useQuery();
  const submitMutation = api.ballot.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Pre-populate from existing ballot
  useEffect(() => {
    if (myBallot.data && restaurants.data && ranked.length === 0) {
      const entries = myBallot.data.entries.map((entry) => {
        const restaurant = restaurants.data.find(
          (r) => r.id === entry.restaurant.id,
        );
        return {
          id: entry.restaurant.id,
          name: entry.restaurant.name,
          slug: entry.restaurant.slug,
          selectedBiscuitTypeId: entry.biscuitType?.id ?? null,
          biscuitTypes:
            restaurant?.biscuits.map((b) => ({
              id: b.biscuitType.id,
              name: b.biscuitType.name,
            })) ?? [],
        };
      });
      setRanked(entries);
    }
  }, [myBallot.data, restaurants.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter out already-ranked restaurants
  const available =
    restaurants.data?.filter((r) => !ranked.some((item) => item.id === r.id)) ??
    [];

  const filteredAvailable = searchQuery
    ? available.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : available;

  const addToRanking = (restaurantId: string) => {
    if (ranked.length >= 5) return;
    const restaurant = restaurants.data?.find((r) => r.id === restaurantId);
    if (!restaurant) return;
    if (ranked.some((r) => r.id === restaurantId)) return;

    setRanked((prev) => [
      ...prev,
      {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        selectedBiscuitTypeId: null,
        biscuitTypes: restaurant.biscuits.map((b) => ({
          id: b.biscuitType.id,
          name: b.biscuitType.name,
        })),
      },
    ]);
  };

  const removeFromRanking = (restaurantId: string) => {
    setRanked((prev) => prev.filter((r) => r.id !== restaurantId));
  };

  const updateBiscuitType = (
    restaurantId: string,
    biscuitTypeId: string | null,
  ) => {
    setRanked((prev) =>
      prev.map((r) =>
        r.id === restaurantId
          ? { ...r, selectedBiscuitTypeId: biscuitTypeId }
          : r,
      ),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedId = active.id as string;
    const overId = over.id as string;

    // Check if dragging from available list to ranking
    const isFromAvailable = !ranked.some((r) => r.id === draggedId);
    const isOverRanking =
      ranked.some((r) => r.id === overId) || overId === "ranking-droppable";

    if (isFromAvailable && (isOverRanking || ranked.length < 5)) {
      addToRanking(draggedId);
      return;
    }

    // Reordering within ranking
    if (!isFromAvailable && ranked.some((r) => r.id === overId)) {
      const oldIndex = ranked.findIndex((r) => r.id === draggedId);
      const newIndex = ranked.findIndex((r) => r.id === overId);
      if (oldIndex !== newIndex) {
        setRanked((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate({
      entries: ranked.map((r, index) => ({
        restaurantId: r.id,
        position: index + 1,
        biscuitTypeId: r.selectedBiscuitTypeId,
      })),
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="text-2xl font-bold text-amber-900">
            Rankings Submitted!
          </h1>
          <p className="mt-2 text-amber-600">
            Thanks for voting! You can come back anytime to update your picks.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => setSubmitted(false)}
              className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              Edit Rankings
            </button>
            <a
              href="/"
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              View Leaderboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const activeRestaurant = activeId
    ? restaurants.data?.find((r) => r.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        <h1 className="mb-2 text-2xl font-bold text-amber-900">
          Rank Your Top 5
        </h1>
        <p className="mb-6 text-amber-600">
          {myBallot.data
            ? "Update your rankings! Drag restaurants or tap to add."
            : "Drag restaurants into your ranked list, or tap to add them."}
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ranked slots */}
          <div className="order-1 lg:order-2">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-700">
              Your Top 5
            </h2>
            <SortableContext
              items={ranked.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {ranked.map((item, index) => (
                  <SortableRankedItem
                    key={item.id}
                    item={item}
                    position={index + 1}
                    onRemove={() => removeFromRanking(item.id)}
                    onBiscuitTypeChange={(btId) =>
                      updateBiscuitType(item.id, btId)
                    }
                  />
                ))}
                {/* Empty slots */}
                {Array.from({ length: 5 - ranked.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center gap-3 rounded-lg border-2 border-dashed border-amber-200 p-3"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-400">
                      {ranked.length + i + 1}
                    </div>
                    <p className="text-sm text-amber-400">
                      {ranked.length === 0 && i === 0
                        ? "Tap a restaurant or drag it here"
                        : "Empty slot"}
                    </p>
                  </div>
                ))}
              </div>
            </SortableContext>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={ranked.length === 0 || submitMutation.isPending}
              className="mt-4 w-full rounded-full bg-amber-600 py-3 font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitMutation.isPending
                ? "Submitting..."
                : ranked.length === 0
                  ? "Add at least 1 restaurant"
                  : `Submit Rankings (${ranked.length}/5)`}
            </button>
            {submitMutation.error && (
              <p className="mt-2 text-sm text-red-600">
                {submitMutation.error.message}
              </p>
            )}
          </div>

          {/* Available restaurants */}
          <div className="order-2 lg:order-1">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-700">
              Restaurants ({available.length})
            </h2>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="mb-3 w-full rounded-md border border-amber-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {filteredAvailable.map((r) => (
                <button
                  key={r.id}
                  onClick={() => addToRanking(r.id)}
                  disabled={ranked.length >= 5}
                  className="flex w-full items-start gap-3 rounded-lg border border-amber-200 bg-white p-3 text-left transition-all hover:border-amber-400 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {r.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="h-10 w-10 flex-shrink-0 rounded border border-amber-200 object-contain bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900">{r.name}</p>
                    {r.biscuits.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.biscuits.map((b) => (
                          <span
                            key={b.biscuitType.id}
                            className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600"
                          >
                            {b.biscuitType.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
              {filteredAvailable.length === 0 && (
                <p className="py-4 text-center text-sm text-amber-500">
                  {searchQuery
                    ? "No matching restaurants"
                    : available.length === 0
                      ? "All restaurants ranked!"
                      : "Loading..."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeRestaurant && (
          <div className="rounded-lg border-2 border-amber-400 bg-white p-3 shadow-lg">
            <p className="font-medium text-amber-900">
              {activeRestaurant.name}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
