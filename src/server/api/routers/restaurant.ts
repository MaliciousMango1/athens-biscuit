import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const restaurantRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.restaurant.findMany({
      where: { active: true },
      include: {
        biscuits: {
          include: { biscuitType: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.restaurant.findUnique({
        where: { slug: input.slug },
        include: {
          biscuits: {
            include: { biscuitType: true },
          },
        },
      });
    }),

  getStatsBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { slug: input.slug },
      });
      if (!restaurant) return null;

      const entries = await ctx.db.ballotEntry.findMany({
        where: { restaurantId: restaurant.id },
        include: { biscuitType: true },
      });

      const positionCounts: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      const biscuitTypeCounts = new Map<
        string,
        { id: string; name: string; slug: string; count: number }
      >();
      let totalPoints = 0;
      const pointsByPosition: Record<number, number> = {
        1: 5,
        2: 4,
        3: 3,
        4: 2,
        5: 1,
      };

      for (const entry of entries) {
        const pos = entry.position;
        if (positionCounts[pos] !== undefined) {
          positionCounts[pos] = (positionCounts[pos] ?? 0) + 1;
          totalPoints += pointsByPosition[pos] ?? 0;
        }
        if (entry.biscuitType) {
          const existing = biscuitTypeCounts.get(entry.biscuitType.id);
          if (existing) {
            existing.count += 1;
          } else {
            biscuitTypeCounts.set(entry.biscuitType.id, {
              id: entry.biscuitType.id,
              name: entry.biscuitType.name,
              slug: entry.biscuitType.slug,
              count: 1,
            });
          }
        }
      }

      const voteCount = entries.length;
      const rawAverage =
        voteCount > 0 ? Math.round((totalPoints / voteCount) * 100) / 100 : 0;

      const biscuitTypeBreakdown = Array.from(biscuitTypeCounts.values()).sort(
        (a, b) => b.count - a.count,
      );

      return {
        voteCount,
        rawAverage,
        positionCounts,
        biscuitTypeBreakdown,
      };
    }),
});
