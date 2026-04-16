import { restaurantRouter } from "~/server/api/routers/restaurant";
import { biscuitTypeRouter } from "~/server/api/routers/biscuitType";
import { leaderboardRouter } from "~/server/api/routers/leaderboard";
import { ballotRouter } from "~/server/api/routers/ballot";
import { suggestionRouter } from "~/server/api/routers/suggestion";
import { adminRouter } from "~/server/api/routers/admin";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  restaurant: restaurantRouter,
  biscuitType: biscuitTypeRouter,
  leaderboard: leaderboardRouter,
  ballot: ballotRouter,
  suggestion: suggestionRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
