"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
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
import { ShareButton } from "~/components/ShareButton";

interface RankedRestaurant {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  selectedBiscuitTypeId: string | null;
  biscuitTypes: { id: string; name: string }[];
}

// Prefix to distinguish available-list draggable IDs from ranked IDs
const AVAIL_PREFIX = "avail:";
const SLOT_PREFIX = "slot:";

// ---------- Ranked item (sortable) ----------
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
      <div
        {...attributes}
        {...listeners}
        className="flex h-8 w-8 flex-shrink-0 cursor-grab items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white active:cursor-grabbing"
      >
        {position}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-amber-900">{item.name}</p>
        {item.biscuitTypes.length > 0 && (
          <select
            value={item.selectedBiscuitTypeId ?? ""}
            onChange={(e) => onBiscuitTypeChange(e.target.value || null)}
            className={`mt-1 w-full rounded border-2 px-2 py-1 text-sm focus:outline-none ${
              item.selectedBiscuitTypeId
                ? "border-amber-400 bg-amber-50 text-amber-800"
                : "border-dashed border-amber-400 bg-amber-50/60 text-amber-700 focus:border-amber-500"
            }`}
          >
            <option value="">👉 Pick your favorite biscuit here</option>
            {item.biscuitTypes.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-amber-400 hover:bg-red-50 hover:text-red-500"
      >
        ✕
      </button>
    </div>
  );
}

// ---------- Empty slot (droppable only) ----------
function EmptySlot({
  slotIndex,
  position,
  isDraggingFromAvailable,
  isFirstEmpty,
}: {
  slotIndex: number;
  position: number;
  isDraggingFromAvailable: boolean;
  isFirstEmpty: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${SLOT_PREFIX}${slotIndex}`,
  });

  const highlight = isDraggingFromAvailable && (isOver || isFirstEmpty);

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 rounded-lg border-2 border-dashed p-3 transition-colors ${
        highlight
          ? "border-amber-500 bg-amber-100"
          : "border-amber-200 bg-transparent"
      }`}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-400">
        {position}
      </div>
      <p className="text-sm text-amber-400">
        {highlight ? "Drop here" : "Empty slot"}
      </p>
    </div>
  );
}

// ---------- Available item (draggable only) ----------
function DraggableAvailableItem({
  id,
  name,
  imageUrl,
  biscuits,
  onClick,
  disabled,
}: {
  id: string;
  name: string;
  imageUrl: string | null;
  biscuits: { biscuitType: { id: string; name: string } }[];
  onClick: () => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${AVAIL_PREFIX}${id}`,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
      onClick={disabled ? undefined : onClick}
      className={`flex w-full items-start gap-3 rounded-lg border border-amber-200 bg-white p-3 text-left transition-all hover:border-amber-400 hover:shadow-sm ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-10 w-10 flex-shrink-0 rounded border border-amber-200 object-contain bg-white"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-amber-900">{name}</p>
        {biscuits.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {biscuits.map((b) => (
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
          imageUrl: restaurant?.imageUrl ?? null,
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

  const available =
    restaurants.data?.filter((r) => !ranked.some((item) => item.id === r.id)) ??
    [];

  const filteredAvailable = searchQuery
    ? available.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : available;

  const buildRankedRestaurant = (restaurantId: string): RankedRestaurant | null => {
    const restaurant = restaurants.data?.find((r) => r.id === restaurantId);
    if (!restaurant) return null;
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      imageUrl: restaurant.imageUrl ?? null,
      selectedBiscuitTypeId: null,
      biscuitTypes: restaurant.biscuits.map((b) => ({
        id: b.biscuitType.id,
        name: b.biscuitType.name,
      })),
    };
  };

  const appendToRanking = (restaurantId: string) => {
    if (ranked.length >= 5) return;
    if (ranked.some((r) => r.id === restaurantId)) return;
    const newItem = buildRankedRestaurant(restaurantId);
    if (!newItem) return;
    setRanked((prev) => [...prev, newItem]);
  };

  const insertAtPosition = (restaurantId: string, index: number) => {
    if (ranked.some((r) => r.id === restaurantId)) return;
    const newItem = buildRankedRestaurant(restaurantId);
    if (!newItem) return;
    setRanked((prev) => {
      const next = [...prev];
      next.splice(index, 0, newItem);
      return next.slice(0, 5); // cap at 5; bumps #5 if full
    });
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

    const activeRaw = active.id as string;
    const overRaw = over.id as string;
    const isFromAvailable = activeRaw.startsWith(AVAIL_PREFIX);

    // Case 1: dragging an available restaurant
    if (isFromAvailable) {
      const restaurantId = activeRaw.slice(AVAIL_PREFIX.length);

      // Dropped on a specific empty slot -> insert at that position
      if (overRaw.startsWith(SLOT_PREFIX)) {
        const slotIndex = parseInt(overRaw.slice(SLOT_PREFIX.length), 10);
        // Slot indexes start at ranked.length (first empty). Clamp.
        const target = Math.min(slotIndex, ranked.length);
        insertAtPosition(restaurantId, target);
        return;
      }

      // Dropped on an existing ranked item -> insert at that item's index
      const existingIdx = ranked.findIndex((r) => r.id === overRaw);
      if (existingIdx !== -1) {
        insertAtPosition(restaurantId, existingIdx);
        return;
      }

      // Fallback -> append to end
      appendToRanking(restaurantId);
      return;
    }

    // Case 2: reordering within the ranked list
    if (ranked.some((r) => r.id === overRaw)) {
      const oldIndex = ranked.findIndex((r) => r.id === activeRaw);
      const newIndex = ranked.findIndex((r) => r.id === overRaw);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
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
          <div className="mt-4 flex flex-wrap justify-center gap-3">
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
            <ShareButton
              label="Tell a friend"
              title="Athens Biscuit"
              text="I just ranked my top 5 Athens biscuit spots — come rank yours!"
              url={
                typeof window !== "undefined"
                  ? `${window.location.origin}/`
                  : "/"
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const isDraggingFromAvailable = !!activeId && activeId.startsWith(AVAIL_PREFIX);
  const activeRestaurantId = isDraggingFromAvailable
    ? activeId?.slice(AVAIL_PREFIX.length)
    : activeId;
  const activeRestaurant = activeRestaurantId
    ? restaurants.data?.find((r) => r.id === activeRestaurantId)
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
        <p className="mb-2 text-amber-600">
          {myBallot.data
            ? "Update your rankings! Drag restaurants or tap to add."
            : "Drag restaurants into your ranked list, or tap to add them."}
        </p>
        <p className="mb-6 text-sm text-amber-500">
          After ranking, pick your favorite biscuit type at each spot to
          help fuel the category leaderboards.
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
                {Array.from({ length: 5 - ranked.length }).map((_, i) => {
                  const slotIndex = ranked.length + i;
                  return (
                    <EmptySlot
                      key={`empty-${slotIndex}`}
                      slotIndex={slotIndex}
                      position={slotIndex + 1}
                      isDraggingFromAvailable={isDraggingFromAvailable}
                      isFirstEmpty={i === 0}
                    />
                  );
                })}
              </div>
            </SortableContext>

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
                <DraggableAvailableItem
                  key={r.id}
                  id={r.id}
                  name={r.name}
                  imageUrl={r.imageUrl ?? null}
                  biscuits={r.biscuits}
                  onClick={() => appendToRanking(r.id)}
                  disabled={ranked.length >= 5}
                />
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
