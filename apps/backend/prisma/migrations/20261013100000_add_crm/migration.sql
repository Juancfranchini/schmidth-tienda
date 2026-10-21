-- Mini CRM: seguimiento de personas por mail (clientes, invitados, carritos
-- abandonados). Solo guarda lo que carga la tienda; los datos de la persona
-- (pedidos, carrito, cuenta) se leen de las tablas que ya existen.

-- CreateTable
CREATE TABLE "CrmContact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tags" TEXT[],
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "lastContactAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmNote" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmContact_email_key" ON "CrmContact"("email");

-- CreateIndex
CREATE INDEX "CrmContact_nextActionAt_idx" ON "CrmContact"("nextActionAt");

-- CreateIndex
CREATE INDEX "CrmNote_contactId_createdAt_idx" ON "CrmNote"("contactId", "createdAt");

-- AddForeignKey
ALTER TABLE "CrmNote" ADD CONSTRAINT "CrmNote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
