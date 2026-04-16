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
});
