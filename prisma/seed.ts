import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create biscuit types
  const biscuitTypes = await Promise.all(
    [
      { name: "Sausage", slug: "sausage" },
      { name: "Cathead", slug: "cathead" },
      { name: "Chicken", slug: "chicken" },
      { name: "Bacon Egg Cheese", slug: "bacon-egg-cheese" },
      { name: "Country Ham", slug: "country-ham" },
      { name: "Gravy", slug: "gravy" },
      { name: "Sweet / Jam", slug: "sweet-jam" },
      { name: "Veggie / Vegan", slug: "veggie-vegan" },
    ].map((bt) =>
      prisma.biscuitType.upsert({
        where: { slug: bt.slug },
        update: {},
        create: bt,
      }),
    ),
  );

  console.log(`Created ${biscuitTypes.length} biscuit types`);

  // Create some Athens restaurants
  const restaurants = [
    {
      name: "Mama's Boy",
      slug: "mamas-boy",
      address: "197 Oak St, Athens, GA 30601",
      notes: "A beloved Athens institution known for Southern comfort food.",
      biscuitSlugs: ["sausage", "cathead", "gravy", "country-ham"],
    },
    {
      name: "Big City Bread Cafe",
      slug: "big-city-bread-cafe",
      address: "393 N Finley St, Athens, GA 30601",
      notes: "Artisan bakery and cafe with outstanding biscuits.",
      biscuitSlugs: ["cathead", "sausage", "bacon-egg-cheese", "sweet-jam"],
    },
    {
      name: "Ike & Jane",
      slug: "ike-and-jane",
      address: "1235 S Milledge Ave #100, Athens, GA 30605",
      notes: "Creative cafe with eclectic biscuit options.",
      biscuitSlugs: ["sausage", "chicken", "bacon-egg-cheese", "veggie-vegan"],
    },
    {
      name: "Weaver D's",
      slug: "weaver-ds",
      address: "1016 E Broad St, Athens, GA 30601",
      notes: "Automatic for the People! Classic soul food.",
      biscuitSlugs: ["cathead", "gravy", "sausage"],
    },
    {
      name: "Mayflower",
      slug: "mayflower",
      address: "1696 S Lumpkin St, Athens, GA 30606",
      notes: "No-frills Southern diner with amazing breakfast.",
      biscuitSlugs: ["sausage", "gravy", "country-ham", "bacon-egg-cheese"],
    },
    {
      name: "Sr. Sol",
      slug: "sr-sol",
      address: "1090 Baxter St, Athens, GA 30606",
      notes: "Mexican-meets-Southern breakfast spot.",
      biscuitSlugs: ["sausage", "chicken", "bacon-egg-cheese"],
    },
    {
      name: "Clocked!",
      slug: "clocked",
      address: "259 W Washington St, Athens, GA 30601",
      notes: "Late-night spot with creative takes on Southern classics.",
      biscuitSlugs: ["chicken", "sausage", "bacon-egg-cheese"],
    },
    {
      name: "Nedza's Waffles & Biscuits",
      slug: "nedzas-waffles-biscuits",
      address: "155 Pulaski St, Athens, GA 30601",
      biscuitSlugs: ["cathead", "chicken", "sausage", "gravy", "sweet-jam"],
    },
  ];

  for (const r of restaurants) {
    const { biscuitSlugs, ...data } = r;
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    });

    // Link biscuit types
    for (const slug of biscuitSlugs) {
      const bt = biscuitTypes.find((b) => b.slug === slug);
      if (bt) {
        await prisma.restaurantBiscuit.upsert({
          where: {
            restaurantId_biscuitTypeId: {
              restaurantId: restaurant.id,
              biscuitTypeId: bt.id,
            },
          },
          update: {},
          create: {
            restaurantId: restaurant.id,
            biscuitTypeId: bt.id,
          },
        });
      }
    }
  }

  console.log(`Created ${restaurants.length} restaurants`);
  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
