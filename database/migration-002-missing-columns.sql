-- ============================================================
-- Migración 002 — Columnas faltantes
-- Ejecutar UNA SOLA VEZ en Supabase → SQL Editor
-- ============================================================

-- 1. Agregar product_label a products (si no existe)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_label TEXT;

-- 2. Permitir image_url NULL en products
--    (el código puede guardar productos sin imagen)
ALTER TABLE products
  ALTER COLUMN image_url DROP NOT NULL;

-- 3. Columnas de auditoría en trade_in_values (si no existen)
ALTER TABLE trade_in_values
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE trade_in_values
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE trade_in_values
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4. Índices útiles (IF NOT EXISTS evita error si ya existen)
CREATE INDEX IF NOT EXISTS idx_tradein_model  ON trade_in_values(model)  WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_tradein_active ON trade_in_values(active);

-- 5. Verificación — debe mostrar las columnas nuevas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('product_label', 'image_url')
ORDER BY column_name;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trade_in_values'
  AND column_name IN ('active', 'created_at', 'updated_at')
ORDER BY column_name;
