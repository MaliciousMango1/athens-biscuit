import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const suggestionRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        kind: z.enum(["restaurant", "biscuit"]),
        name: z.string().min(1).max(200),
        details: z.string().max(1000).optional(),
        email: z.string().email().optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.suggestion.create({
        data: {
          kind: input.kind,
          name: input.name,
          details: input.details ?? null,
          email: input.email || null,
        },
      });
    }),
});
