import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const biscuitTypeRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.biscuitType.findMany({
      orderBy: { name: "asc" },
    });
  }),
});
