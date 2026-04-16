import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

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

  // Athens biscuit restaurants
  const restaurants = [
    { name: "Mama's Boy", slug: "mamas-boy" },
    { name: "Golden Pantry", slug: "golden-pantry" },
    { name: "Chick-fil-A", slug: "chick-fil-a" },
    { name: "The Farm Cart", slug: "the-farm-cart" },
    { name: "Biscuit Basket", slug: "biscuit-basket" },
    { name: "The Flying Biscuit Cafe", slug: "the-flying-biscuit-cafe" },
    { name: "Big City Bread", slug: "big-city-bread" },
    { name: "Cafe Racer", slug: "cafe-racer" },
    { name: "Sully's Steams", slug: "sullys-steams" },
    { name: "The Place", slug: "the-place" },
    { name: "Team Biscuits & Burgers", slug: "team-biscuits-and-burgers" },
    { name: "Strickland's", slug: "stricklands" },
    { name: "Suncatcher Cafe", slug: "suncatcher-cafe" },
    { name: "Another Broken Egg Cafe", slug: "another-broken-egg-cafe" },
    { name: "First Watch", slug: "first-watch" },
    { name: "QuikTrip", slug: "quiktrip" },
    { name: "RaceTrac", slug: "racetrac" },
  ];

  for (const r of restaurants) {
    await prisma.restaurant.upsert({
      where: { slug: r.slug },
      update: {},
      create: r,
    });
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
