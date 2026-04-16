-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "imageUrl" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiscuitType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "BiscuitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantBiscuit" (
    "restaurantId" TEXT NOT NULL,
    "biscuitTypeId" TEXT NOT NULL,

    CONSTRAINT "RestaurantBiscuit_pkey" PRIMARY KEY ("restaurantId","biscuitTypeId")
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BallotEntry" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "biscuitTypeId" TEXT,

    CONSTRAINT "BallotEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

-- CreateIndex
CREATE INDEX "Restaurant_slug_idx" ON "Restaurant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BiscuitType_name_key" ON "BiscuitType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BiscuitType_slug_key" ON "BiscuitType"("slug");

-- CreateIndex
CREATE INDEX "BiscuitType_slug_idx" ON "BiscuitType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_visitorId_key" ON "Ballot"("visitorId");

-- CreateIndex
CREATE INDEX "Ballot_ipHash_idx" ON "Ballot"("ipHash");

-- CreateIndex
CREATE UNIQUE INDEX "BallotEntry_ballotId_position_key" ON "BallotEntry"("ballotId","position");

-- CreateIndex
CREATE UNIQUE INDEX "BallotEntry_ballotId_restaurantId_key" ON "BallotEntry"("ballotId","restaurantId");

-- AddForeignKey
ALTER TABLE "RestaurantBiscuit" ADD CONSTRAINT "RestaurantBiscuit_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantBiscuit" ADD CONSTRAINT "RestaurantBiscuit_biscuitTypeId_fkey" FOREIGN KEY ("biscuitTypeId") REFERENCES "BiscuitType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotEntry" ADD CONSTRAINT "BallotEntry_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotEntry" ADD CONSTRAINT "BallotEntry_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotEntry" ADD CONSTRAINT "BallotEntry_biscuitTypeId_fkey" FOREIGN KEY ("biscuitTypeId") REFERENCES "BiscuitType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
