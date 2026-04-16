import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Build a UI-avatars URL with the restaurant's initials on an amber background.
// Uniform look across all restaurants. Swap in real logos via admin later.
function avatar(name: string): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=d97706&color=fff&size=256&bold=true&font-size=0.4`;
}

async function main() {
  console.log("Seeding database...");

  // Create biscuit types
  const biscuitTypes = await Promise.all(
    [
      { name: "Sausage", slug: "sausage" },
      { name: "Honey Butter", slug: "honey-butter" },
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

  // Athens-area biscuit restaurants
  const restaurants = [
    {
      name: "Angie's Place",
      slug: "angies-place",
      address: "10336 Hull Colbert Rd, Hull, GA 30646",
      notes: "Unassuming breakfast spot in Hull, just outside Athens. Known for huge biscuits and old-fashioned Southern cooking. No-frills, cash-friendly.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "country-ham", "gravy"],
    },
    {
      name: "Mama's Boy",
      slug: "mamas-boy",
      address: "197 Oak St, Athens, GA 30601",
      website: "https://www.mamasboyathens.com/",
      notes: "Named one of Southern Living's 'The South's Best Biscuit Joints.' Classic buttermilk biscuits with sausage thyme gravy.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "gravy", "sweet-jam"],
    },
    {
      name: "Golden Pantry",
      slug: "golden-pantry",
      address: "126 N Milledge Ave, Athens, GA 30601",
      website: "https://www.goldenpantry.com/",
      notes: "Biscuits from scratch daily — their 'claim to fame.' Build-your-own biscuits. Open 24 hours.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "country-ham", "chicken"],
    },
    {
      name: "Chick-fil-A",
      slug: "chick-fil-a",
      website: "https://www.chick-fil-a.com/",
      notes: "Chain. Famous chicken biscuit, plus spicy chicken, bacon egg cheese, and buttery biscuit options.",
      biscuitSlugs: ["chicken", "bacon-egg-cheese", "sausage"],
    },
    {
      name: "McDonald's",
      slug: "mcdonalds",
      website: "https://www.mcdonalds.com/",
      notes: "Chain. Sausage biscuit, bacon egg & cheese biscuit, and sausage egg & cheese biscuit.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese"],
    },
    {
      name: "The Farm Cart",
      slug: "the-farm-cart",
      address: "1074 Baxter St, Athens, GA 30606",
      website: "https://thefarmcart.com/",
      notes: "Family-owned, breakfast all day. Huge buttermilk biscuit sandwiches made from scratch. Has a plant-based 'Impossible' option.",
      biscuitSlugs: ["chicken", "sausage", "bacon-egg-cheese", "gravy", "veggie-vegan", "sweet-jam"],
    },
    {
      name: "Biscuit Basket",
      slug: "biscuit-basket",
      address: "723 Boulevard, Athens, GA 30601",
      notes: "Hidden gem inside a convenience store. Large scratch biscuits with tenderloin, sausage, bacon.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "country-ham", "gravy"],
    },
    {
      name: "The Flying Biscuit Cafe",
      slug: "the-flying-biscuit-cafe",
      address: "1850 Epps Bridge Pkwy, Athens, GA 30606",
      website: "https://www.flyingbiscuit.com/",
      notes: "Bakes nearly 5,000 biscuits per week per location. Signature fluffy biscuits served with cranberry apple butter.",
      biscuitSlugs: ["chicken", "bacon-egg-cheese", "gravy", "sweet-jam"],
    },
    {
      name: "Big City Bread Cafe",
      slug: "big-city-bread",
      address: "393 N Finley St, Athens, GA 30601",
      website: "https://www.bigcitybreadcafe.com/",
      notes: "Casual family-run cafe serving house-made bread and pastries. Buttermilk biscuit sandwiches.",
      biscuitSlugs: ["bacon-egg-cheese", "sausage", "sweet-jam"],
    },
    {
      name: "Cafe Racer",
      slug: "cafe-racer",
      address: "2343 W Broad St, Athens, GA 30606",
      website: "https://www.caferacer78.com/",
      notes: "Donuts and big biscuit sandwiches. Original biscuit has strawberry preserves, sausage, egg, and pepper jack.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "sweet-jam"],
    },
    {
      name: "The Place",
      slug: "the-place",
      address: "229 E Broad St, Athens, GA 30601",
      website: "https://www.theplaceathens.com/",
      notes: "Southern restaurant downtown (across from The Arch). Homemade biscuits at Sunday brunch with various preparations.",
      biscuitSlugs: ["chicken", "sausage", "gravy", "bacon-egg-cheese"],
    },
    {
      name: "Team Biscuits & Burgers",
      slug: "team-biscuits-and-burgers",
      address: "745 Danielsville Rd, Athens, GA 30601",
      notes: "Large handmade cathead-style buttermilk biscuits with bacon, steak, sausage, bologna, country ham, or salmon.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "country-ham", "gravy"],
    },
    {
      name: "Strickland's",
      slug: "stricklands",
      address: "4723 Atlanta Hwy, Bogart, GA 30622",
      website: "https://www.stricklandsrestaurant.com/",
      notes: "Local favorite since 1960. Known for having some of the best biscuits in Georgia. Just west of Athens in Bogart.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "country-ham", "chicken", "gravy"],
    },
    {
      name: "Suncatcher Cafe",
      slug: "suncatcher-cafe",
      address: "42 Greensboro Hwy, Ste B, Watkinsville, GA 30677",
      notes: "Southern breakfast/brunch in nearby Watkinsville. Fluffy biscuits with homemade sausage gravy.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "country-ham", "gravy"],
    },
    {
      name: "Another Broken Egg Cafe",
      slug: "another-broken-egg-cafe",
      address: "2375 W Broad St, Ste B, Athens, GA 30606",
      website: "https://www.anotherbrokenegg.com/",
      notes: "Chain brunch spot. Biscuit Beignets and oversized biscuit topped with country sausage and eggs.",
      biscuitSlugs: ["sausage", "gravy", "sweet-jam"],
    },
    {
      name: "First Watch",
      slug: "first-watch",
      address: "140 Alps Rd, Athens, GA 30606",
      website: "https://firstwatch.com/",
      notes: "Chain breakfast/brunch. House-baked buttermilk biscuit with turkey sausage gravy.",
      biscuitSlugs: ["gravy", "bacon-egg-cheese"],
    },
    {
      name: "QuikTrip",
      slug: "quiktrip",
      website: "https://www.quiktrip.com/",
      notes: "Gas station chain. Giant buttermilk biscuits — sausage, sausage egg cheese, chicken, and biscuit & gravy.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "chicken", "gravy"],
    },
    {
      name: "RaceTrac",
      slug: "racetrac",
      website: "https://www.racetrac.com/",
      notes: "Gas station chain. Sausage egg cheese biscuits and chicken biscuits, made in-store with Jimmy Dean sausage and Tyson chicken.",
      biscuitSlugs: ["sausage", "bacon-egg-cheese", "chicken"],
    },
  ];

  for (const r of restaurants) {
    const { biscuitSlugs, ...data } = r;
    const imageUrl = avatar(data.name);
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: data.slug },
      // Update existing rows so re-running the seed refreshes fields
      update: {
        name: data.name,
        address: data.address ?? null,
        website: data.website ?? null,
        imageUrl,
        notes: data.notes ?? null,
      },
      create: { ...data, imageUrl },
    });

    // Link biscuit types (upsert so it's idempotent)
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

  console.log(`Created/updated ${restaurants.length} restaurants`);
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
