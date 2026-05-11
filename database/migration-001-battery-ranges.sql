-- ============================================================
-- Migración 001 — Plan Canje: renombrar estados de batería
-- y agregar columnas active / timestamps
--
-- Ejecutar UNA SOLA VEZ en Supabase → SQL Editor
-- ============================================================

-- 1. Renombrar valores del enum battery_state
--    (solo si todavía tienen los valores viejos)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'battery_state' AND e.enumlabel = 'excelente'
  ) THEN
    ALTER TYPE battery_state RENAME VALUE 'excelente' TO '100-90';
    ALTER TYPE battery_state RENAME VALUE 'bueno'     TO '89-70';
    ALTER TYPE battery_state RENAME VALUE 'regular'   TO 'MENOS-70';
  END IF;
END $$;

-- 2. Agregar columna active si no existe
ALTER TABLE trade_in_values
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Agregar columnas de auditoría si no existen
ALTER TABLE trade_in_values
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE trade_in_values
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_tradein_model  ON trade_in_values(model)  WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_tradein_active ON trade_in_values(active);

-- Verificación final
SELECT
  (SELECT COUNT(*) FROM trade_in_values)               AS total_entries,
  (SELECT COUNT(DISTINCT model) FROM trade_in_values)  AS total_models,
  array_agg(DISTINCT battery_state ORDER BY battery_state) AS battery_states
FROM trade_in_values;
