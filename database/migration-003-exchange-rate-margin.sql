-- ============================================================
-- Migration 003: dólar automático con margen admin
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'exchange_rate'
      AND c.relkind = 'v'
  ) THEN
    DROP VIEW exchange_rate;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS exchange_rate (
  id                 INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  api_value          NUMERIC(10, 2) NOT NULL CHECK (api_value > 0),
  admin_margin       NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (admin_margin >= 0),
  final_value        NUMERIC(10, 2) NOT NULL CHECK (final_value > 0),
  source             TEXT NOT NULL DEFAULT 'seed' CHECK (source IN ('api_cron', 'api_manual_refresh', 'admin_margin_update', 'legacy_fallback', 'seed')),
  last_api_update    TIMESTAMPTZ,
  last_manual_update TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exchange_rate_history (
  id            SERIAL PRIMARY KEY,
  api_value     NUMERIC(10, 2),
  admin_margin  NUMERIC(10, 2),
  final_value   NUMERIC(10, 2),
  source        TEXT NOT NULL CHECK (source IN ('api_cron', 'api_manual_refresh', 'admin_margin_update', 'legacy_fallback', 'seed')),
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO exchange_rate (id, api_value, admin_margin, final_value, source, updated_at)
SELECT
  1,
  COALESCE((SELECT rate FROM dollar_rate ORDER BY id DESC LIMIT 1), 1200),
  0,
  COALESCE((SELECT rate FROM dollar_rate ORDER BY id DESC LIMIT 1), 1200),
  'seed',
  NOW()
ON CONFLICT (id) DO NOTHING;

INSERT INTO exchange_rate_history (api_value, admin_margin, final_value, source)
SELECT api_value, admin_margin, final_value, 'seed'
FROM exchange_rate
WHERE NOT EXISTS (
  SELECT 1
  FROM exchange_rate_history
  WHERE source = 'seed'
);
