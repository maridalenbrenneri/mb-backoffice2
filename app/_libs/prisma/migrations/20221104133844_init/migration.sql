-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('PRIVATE', 'PRIVATE_GIFT', 'B2B');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'CANCELLED', 'DELETED');

-- CreateEnum
CREATE TYPE "SubscriptionFrequency" AS ENUM ('MONTHLY', 'FORTNIGHTLY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Coffee" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coffee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "SubscriptionType" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "frequency" "SubscriptionFrequency" NOT NULL,
    "quantity250" INTEGER NOT NULL DEFAULT 0,
    "quantity500" INTEGER NOT NULL DEFAULT 0,
    "quantity1200" INTEGER NOT NULL DEFAULT 0,
    "customerNote" TEXT,
    "internalNote" TEXT,
    "fikenContactId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftSubscription" (
    "id" SERIAL NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "originalFirstDeliveryDate" TIMESTAMP(3) NOT NULL,
    "firstDeliveryDate" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "messageToRecipient" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientMobile" TEXT,
    "recipientAddress" TEXT,
    "wooCustomerId" INTEGER,
    "wooOrderId" INTEGER,
    "wooOrderLineItemId" TEXT,
    "subscriptionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "coffee1Id" INTEGER,
    "coffee2Id" INTEGER,
    "coffee3Id" INTEGER,
    "coffee4Id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "variation" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "addressStreet1" TEXT NOT NULL,
    "addressStreet2" TEXT,
    "addressPostcode" TEXT NOT NULL,
    "addressPlace" TEXT NOT NULL,
    "addressCountry" TEXT,
    "subscriptionId" INTEGER NOT NULL,
    "deliveryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WooImportResult" (
    "id" SERIAL NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WooImportResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_fikenContactId_key" ON "Subscription"("fikenContactId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftSubscription_wooOrderLineItemId_key" ON "GiftSubscription"("wooOrderLineItemId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftSubscription_subscriptionId_key" ON "GiftSubscription"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftSubscription" ADD CONSTRAINT "GiftSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_coffee1Id_fkey" FOREIGN KEY ("coffee1Id") REFERENCES "Coffee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_coffee2Id_fkey" FOREIGN KEY ("coffee2Id") REFERENCES "Coffee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_coffee3Id_fkey" FOREIGN KEY ("coffee3Id") REFERENCES "Coffee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_coffee4Id_fkey" FOREIGN KEY ("coffee4Id") REFERENCES "Coffee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
