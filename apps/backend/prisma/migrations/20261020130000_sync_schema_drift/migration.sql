-- Las migraciones heredadas de HomePadel no creaban estas columnas ni la tabla Shipment,
-- aunque el esquema y el código las usan (su base se armó por otra vía). Sin esto, una
-- base nueva queda distinta del esquema y el seed falla. Solo agrega; no borra nada.
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "estimatedDays" INTEGER,
ADD COLUMN     "isMadeToOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiredDeposit" DOUBLE PRECISION,
ADD COLUMN     "shape" TEXT,
ADD COLUMN     "showCompare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showHighlights" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showPerformance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showRelated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showVideo" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "carrier" TEXT NOT NULL DEFAULT 'CORREO_ARGENTINO',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "labelUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

