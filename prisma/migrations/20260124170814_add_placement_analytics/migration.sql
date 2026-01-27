/*
  Warnings:

  - You are about to drop the column `fullName` on the `CandidateProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "selectedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CandidateProfile" DROP COLUMN "fullName",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "PlacementStats" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalPlaced" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPlacementStats" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "placedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPlacementStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlacementStats_year_key" ON "PlacementStats"("year");

-- CreateIndex
CREATE INDEX "PlacementStats_year_idx" ON "PlacementStats"("year");

-- CreateIndex
CREATE INDEX "CompanyPlacementStats_year_idx" ON "CompanyPlacementStats"("year");

-- CreateIndex
CREATE INDEX "CompanyPlacementStats_companyName_idx" ON "CompanyPlacementStats"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPlacementStats_companyName_year_key" ON "CompanyPlacementStats"("companyName", "year");
