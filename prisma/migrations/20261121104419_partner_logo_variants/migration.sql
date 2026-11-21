-- AlterEnum
ALTER TYPE "PartnerType" ADD VALUE 'INTERNATIONAL_PARTNER';

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "logoHeight" INTEGER,
ADD COLUMN     "logoOnDarkPublicId" TEXT,
ADD COLUMN     "logoOnDarkUrl" TEXT,
ADD COLUMN     "logoWidth" INTEGER;
