-- Schmidt: material del producto y color (hex) de cada variante para las muestras de la tienda.
-- Solo agrega columnas opcionales: no toca datos existentes.
ALTER TABLE "Product" ADD COLUMN "material" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "colorHex" TEXT;
