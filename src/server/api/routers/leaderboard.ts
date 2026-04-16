import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getLeaderboard } from "~/server/scoring";

export const leaderboardRouter = createTRPCRouter({
  ranked: publicProcedure
    .input(
      z
        .object({
          biscuitTypeSlug: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return getLeaderboard(ctx.db, {
        biscuitTypeSlug: input?.biscuitTypeSlug,
      });
    }),
});
