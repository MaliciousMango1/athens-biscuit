import { POSITION_POINTS, BAYESIAN_CONFIDENCE } from "~/lib/constants";
import type { PrismaClient } from "../../generated/prisma";

export interface LeaderboardEntry {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  address: string | null;
  imageUrl: string | null;
  voteCount: number;
  rawAverage: number;
  bayesianScore: number;
  topBiscuitType: string | null;
}

export function positionToPoints(position: number): number {
  return POSITION_POINTS[position] ?? 0;
}

export async function getLeaderboard(
  db: PrismaClient,
  options?: { biscuitTypeSlug?: string },
): Promise<LeaderboardEntry[]> {
  // Get all ballot entries with restaurant info
  const whereClause: Record<string, unknown> = {
    restaurant: { active: true },
  };

  if (options?.biscuitTypeSlug) {
    whereClause.biscuitType = { slug: options.biscuitTypeSlug };
  }

  const entries = await db.ballotEntry.findMany({
    where: whereClause,
    include: {
      restaurant: true,
      biscuitType: true,
    },
  });

  // Group by restaurant
  const restaurantMap = new Map<
    string,
    {
      restaurant: { id: string; name: string; slug: string; address: string | null; imageUrl: string | null };
      points: number[];
      biscuitTypeCounts: Map<string, number>;
    }
  >();

  for (const entry of entries) {
    const points = positionToPoints(entry.position);
    const existing = restaurantMap.get(entry.restaurantId);
    if (existing) {
      existing.points.push(points);
      if (entry.biscuitType) {
        const count = existing.biscuitTypeCounts.get(entry.biscuitType.name) ?? 0;
        existing.biscuitTypeCounts.set(entry.biscuitType.name, count + 1);
      }
    } else {
      const biscuitTypeCounts = new Map<string, number>();
      if (entry.biscuitType) {
        biscuitTypeCounts.set(entry.biscuitType.name, 1);
      }
      restaurantMap.set(entry.restaurantId, {
        restaurant: {
          id: entry.restaurant.id,
          name: entry.restaurant.name,
          slug: entry.restaurant.slug,
          address: entry.restaurant.address,
          imageUrl: entry.restaurant.imageUrl,
        },
        points: [points],
        biscuitTypeCounts,
      });
    }
  }

  // Calculate global average
  const allPoints = Array.from(restaurantMap.values()).flatMap((r) => r.points);
  const globalAvg =
    allPoints.length > 0
      ? allPoints.reduce((a, b) => a + b, 0) / allPoints.length
      : 3; // default if no votes at all

  const m = BAYESIAN_CONFIDENCE;

  // Calculate Bayesian score for each restaurant
  const leaderboard: LeaderboardEntry[] = Array.from(restaurantMap.values()).map(
    ({ restaurant, points, biscuitTypeCounts }) => {
      const v = points.length;
      const R = points.reduce((a, b) => a + b, 0) / v;
      const bayesianScore = (v / (v + m)) * R + (m / (v + m)) * globalAvg;

      // Find most popular biscuit type
      let topBiscuitType: string | null = null;
      let maxCount = 0;
      for (const [name, count] of biscuitTypeCounts) {
        if (count > maxCount) {
          maxCount = count;
          topBiscuitType = name;
        }
      }

      return {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        address: restaurant.address,
        imageUrl: restaurant.imageUrl,
        voteCount: v,
        rawAverage: Math.round(R * 100) / 100,
        bayesianScore: Math.round(bayesianScore * 100) / 100,
        topBiscuitType,
      };
    },
  );

  // Sort by Bayesian score descending
  leaderboard.sort((a, b) => b.bayesianScore - a.bayesianScore);

  return leaderboard;
}
