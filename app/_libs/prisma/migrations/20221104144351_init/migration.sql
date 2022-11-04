/*
  Warnings:

  - You are about to drop the column `recipientAddress` on the `GiftSubscription` table. All the data in the column will be lost.
  - Added the required column `recipientPlace` to the `GiftSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientPostcode` to the `GiftSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientStreet1` to the `GiftSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "GiftSubscription" DROP COLUMN "recipientAddress",
ADD COLUMN     "recipientCountry" TEXT,
ADD COLUMN     "recipientPlace" TEXT NOT NULL,
ADD COLUMN     "recipientPostcode" TEXT NOT NULL,
ADD COLUMN     "recipientStreet1" TEXT NOT NULL,
ADD COLUMN     "recipientStreet2" TEXT;
