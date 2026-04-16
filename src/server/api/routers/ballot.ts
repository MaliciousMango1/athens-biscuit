import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { verifyTurnstileToken } from "~/lib/turnstile";
import { hashIp, getClientIp } from "~/lib/voter";
import { VISITOR_COOKIE_NAME, MAX_SUBMISSIONS_PER_HOUR } from "~/lib/constants";

export const ballotRouter = createTRPCRouter({
  getMyBallot: publicProcedure.query(async ({ ctx }) => {
    const visitorId = ctx.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${VISITOR_COOKIE_NAME}=`))
      ?.split("=")[1];

    if (!visitorId) return null;

    const ballot = await ctx.db.ballot.findUnique({
      where: { visitorId },
      include: {
        entries: {
          include: { restaurant: true, biscuitType: true },
          orderBy: { position: "asc" },
        },
      },
    });

    return ballot;
  }),

  submit: publicProcedure
    .input(
      z.object({
        turnstileToken: z.string().optional(),
        entries: z.array(
          z.object({
            restaurantId: z.string(),
            position: z.number().min(1).max(5),
            biscuitTypeId: z.string().nullable().optional(),
          }),
        ).min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get visitor ID from cookie
      const visitorId = ctx.headers
        .get("cookie")
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${VISITOR_COOKIE_NAME}=`))
        ?.split("=")[1];

      if (!visitorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Visitor cookie not found. Please enable cookies.",
        });
      }

      // Verify Turnstile token
      const clientIp = getClientIp(ctx.headers);
      if (input.turnstileToken) {
        const isValid = await verifyTurnstileToken(input.turnstileToken, clientIp);
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "CAPTCHA verification failed.",
          });
        }
      }

      const ipHash = hashIp(clientIp);

      // Rate limit: check submissions per IP in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentSubmissions = await ctx.db.ballot.count({
        where: {
          ipHash,
          updatedAt: { gte: oneHourAgo },
          visitorId: { not: visitorId }, // don't count this visitor's own updates
        },
      });

      if (recentSubmissions >= MAX_SUBMISSIONS_PER_HOUR) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many submissions from this network. Please try again later.",
        });
      }

      // Validate that all restaurants exist
      const restaurantIds = input.entries.map((e) => e.restaurantId);
      const restaurants = await ctx.db.restaurant.findMany({
        where: { id: { in: restaurantIds }, active: true },
      });
      if (restaurants.length !== restaurantIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more selected restaurants are invalid.",
        });
      }

      // Upsert ballot and replace its entries atomically
      await ctx.db.$transaction(async (tx) => {
        const ballot = await tx.ballot.upsert({
          where: { visitorId },
          create: { visitorId, ipHash },
          update: { ipHash },
        });

        // Delete any prior entries (no-op on fresh create) then add the new set
        await tx.ballotEntry.deleteMany({ where: { ballotId: ballot.id } });
        await tx.ballotEntry.createMany({
          data: input.entries.map((e) => ({
            ballotId: ballot.id,
            restaurantId: e.restaurantId,
            position: e.position,
            biscuitTypeId: e.biscuitTypeId ?? null,
          })),
        });
      });

      return { success: true };
    }),
});
