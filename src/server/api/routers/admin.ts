import { z } from "zod";
import { createTRPCRouter, adminProcedure, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function avatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d97706&color=fff&size=256&bold=true&font-size=0.4`;
}

export const adminRouter = createTRPCRouter({
  // Login check - public so the login form can call it
  login: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(({ input }) => {
      if (input.password === env.ADMIN_PASSWORD) {
        return { success: true };
      }
      return { success: false };
    }),

  // Restaurant CRUD
  listRestaurants: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.restaurant.findMany({
      include: {
        biscuits: { include: { biscuitType: true } },
        _count: { select: { entries: true } },
      },
      orderBy: { name: "asc" },
    });
  }),

  createRestaurant: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        notes: z.string().optional(),
        biscuitTypeIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.name);
      const restaurant = await ctx.db.restaurant.create({
        data: {
          name: input.name,
          slug,
          address: input.address ?? null,
          website: input.website || null,
          imageUrl: avatarUrl(input.name),
          notes: input.notes ?? null,
          biscuits: input.biscuitTypeIds
            ? {
                create: input.biscuitTypeIds.map((id) => ({
                  biscuitTypeId: id,
                })),
              }
            : undefined,
        },
      });
      return restaurant;
    }),

  updateRestaurant: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        notes: z.string().optional(),
        active: z.boolean().optional(),
        biscuitTypeIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, biscuitTypeIds, ...data } = input;

      // Update slug and avatar if name changed
      const updateData: Record<string, unknown> = { ...data };
      if (data.name) {
        updateData.slug = slugify(data.name);
        updateData.imageUrl = avatarUrl(data.name);
      }

      const restaurant = await ctx.db.restaurant.update({
        where: { id },
        data: updateData,
      });

      // Update biscuit type associations if provided
      if (biscuitTypeIds !== undefined) {
        await ctx.db.restaurantBiscuit.deleteMany({
          where: { restaurantId: id },
        });
        if (biscuitTypeIds.length > 0) {
          await ctx.db.restaurantBiscuit.createMany({
            data: biscuitTypeIds.map((biscuitTypeId) => ({
              restaurantId: id,
              biscuitTypeId,
            })),
          });
        }
      }

      return restaurant;
    }),

  deleteRestaurant: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.restaurant.delete({ where: { id: input.id } });
    }),

  // Biscuit Type CRUD
  listBiscuitTypes: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.biscuitType.findMany({
      include: { _count: { select: { restaurants: true } } },
      orderBy: { name: "asc" },
    });
  }),

  createBiscuitType: adminProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.biscuitType.create({
        data: {
          name: input.name,
          slug: slugify(input.name),
        },
      });
    }),

  deleteBiscuitType: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.biscuitType.delete({ where: { id: input.id } });
    }),

  // Suggestions
  listSuggestions: adminProcedure
    .input(
      z.object({ status: z.string().optional() }).optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.suggestion.findMany({
        where: input?.status ? { status: input.status } : undefined,
        orderBy: { createdAt: "desc" },
      });
    }),

  updateSuggestionStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["approved", "rejected"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.suggestion.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  // Ballots list
  listBallots: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.ballot.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        entries: {
          orderBy: { position: "asc" },
          include: {
            restaurant: true,
            biscuitType: true,
          },
        },
      },
    });
  }),

  // Stats
  stats: adminProcedure.query(async ({ ctx }) => {
    const [restaurantCount, biscuitTypeCount, ballotCount, suggestionCount] =
      await Promise.all([
        ctx.db.restaurant.count({ where: { active: true } }),
        ctx.db.biscuitType.count(),
        ctx.db.ballot.count(),
        ctx.db.suggestion.count({ where: { status: "pending" } }),
      ]);
    return { restaurantCount, biscuitTypeCount, ballotCount, suggestionCount };
  }),
});
