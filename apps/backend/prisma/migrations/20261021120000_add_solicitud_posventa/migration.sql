-- Solicitudes de posventa (arrepentimiento, cambio, falla). Solo agrega una tabla y dos enums.
-- CreateEnum
CREATE TYPE "TipoSolicitud" AS ENUM ('ARREPENTIMIENTO', 'CAMBIO', 'FALLA');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'EN_CURSO', 'RESUELTA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "SolicitudPosventa" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoSolicitud" NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "origen" TEXT NOT NULL DEFAULT 'tienda',
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "pedidoNumero" TEXT NOT NULL,
    "orderId" TEXT,
    "motivo" TEXT,
    "notas" TEXT,
    "resueltaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudPosventa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudPosventa_codigo_key" ON "SolicitudPosventa"("codigo");

-- CreateIndex
CREATE INDEX "SolicitudPosventa_estado_createdAt_idx" ON "SolicitudPosventa"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "SolicitudPosventa_orderId_idx" ON "SolicitudPosventa"("orderId");

-- AddForeignKey
ALTER TABLE "SolicitudPosventa" ADD CONSTRAINT "SolicitudPosventa_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

