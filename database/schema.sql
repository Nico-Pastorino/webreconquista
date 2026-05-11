-- ============================================================
-- Schema para tienda Apple - PostgreSQL (Neon / Supabase)
-- ============================================================

-- Categorías como enum
CREATE TYPE product_category AS ENUM (
  'iphone', 'ipad', 'mac', 'watch', 'airpods', 'accesorios'
);

-- battery_state values: '100-90' (100% a 90%) | '89-70' (89% a 70%) | 'MENOS-70' (Menos de 70%)
-- Migration from old values: excelente→100-90, bueno→89-70, regular→MENOS-70
-- ALTER TYPE battery_state RENAME VALUE 'excelente' TO '100-90';
-- ALTER TYPE battery_state RENAME VALUE 'bueno' TO '89-70';
-- ALTER TYPE battery_state RENAME VALUE 'regular' TO 'MENOS-70';
CREATE TYPE battery_state AS ENUM ('100-90', '89-70', 'MENOS-70');

-- Productos
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  category    product_category NOT NULL,
  price_usd   NUMERIC(10, 2) NOT NULL CHECK (price_usd > 0),
  image_url   TEXT NOT NULL,
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  specs       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category) WHERE active = TRUE;
CREATE INDEX idx_products_featured  ON products(featured)  WHERE active = TRUE;
CREATE INDEX idx_products_slug      ON products(slug);

-- Planes de cuotas (legacy — se mantiene para backwards-compat)
CREATE TABLE installment_plans (
  id             SERIAL PRIMARY KEY,
  months         SMALLINT NOT NULL CHECK (months > 0),
  surcharge_pct  NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (surcharge_pct >= 0),
  label          TEXT,
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (months)
);

-- Grupos de financiación (ej: "Banco Nación", "Visa / Mastercard")
CREATE TABLE financing_groups (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order SMALLINT NOT NULL DEFAULT 0
);

-- Opciones de cuotas dentro de cada grupo
CREATE TABLE financing_options (
  id            SERIAL PRIMARY KEY,
  group_id      INTEGER NOT NULL REFERENCES financing_groups(id) ON DELETE CASCADE,
  installments  SMALLINT NOT NULL CHECK (installments > 0),
  surcharge_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (surcharge_pct >= 0),
  label         TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    SMALLINT NOT NULL DEFAULT 0
);

-- Valor del dólar (siempre 1 fila, actualizamos en lugar de insertar)
CREATE TABLE dollar_rate (
  id         SERIAL PRIMARY KEY,
  rate       NUMERIC(10, 2) NOT NULL CHECK (rate > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plan canje - valores de usados
CREATE TABLE trade_in_values (
  id            SERIAL PRIMARY KEY,
  model         TEXT NOT NULL,
  capacity      TEXT NOT NULL,
  battery_state battery_state NOT NULL,
  value_usd     NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (value_usd >= 0),
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (model, capacity, battery_state)
);

CREATE INDEX idx_tradein_model   ON trade_in_values(model)  WHERE active = TRUE;
CREATE INDEX idx_tradein_active  ON trade_in_values(active);

-- Configuración del sitio
CREATE TABLE site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ============================================================
-- Datos iniciales
-- ============================================================

INSERT INTO dollar_rate (rate) VALUES (1200);

INSERT INTO installment_plans (months, surcharge_pct, label) VALUES
  (1,  0,  '1 pago sin recargo'),
  (3,  0,  '3 cuotas sin interés'),
  (6,  30, '6 cuotas'),
  (12, 60, '12 cuotas');

INSERT INTO financing_groups (name, active, sort_order) VALUES
  ('Efectivo / Débito', TRUE, 1),
  ('Tarjeta de crédito', TRUE, 2);

INSERT INTO financing_options (group_id, installments, surcharge_pct, label, active, sort_order) VALUES
  (1, 1,  0,  '1 pago sin recargo',   TRUE, 1),
  (2, 3,  0,  '3 cuotas sin interés', TRUE, 1),
  (2, 6,  30, '6 cuotas',             TRUE, 2),
  (2, 12, 60, '12 cuotas',            TRUE, 3);

INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number',   '5491100000000'),
  ('whatsapp_message',  'Hola! Me interesa el producto: '),
  ('store_name',        'iStore Reconquista'),
  ('store_tagline',     'Productos Apple al mejor precio'),
  ('trade_in_enabled',  'true'),
  ('show_usd_price',    'true'),
  ('show_installments', 'true');

-- Productos demo
INSERT INTO products (slug, name, category, price_usd, image_url, featured, description, specs) VALUES
  (
    'iphone-15-pro-256gb',
    'iPhone 15 Pro 256GB',
    'iphone',
    1099,
    'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009285394',
    TRUE,
    'El iPhone más potente con chip A17 Pro y sistema de cámara Pro.',
    '{"chip": "A17 Pro", "pantalla": "6.1\" Super Retina XDR", "cámara": "48 MP Main", "batería": "Todo el día"}'
  ),
  (
    'iphone-15-128gb',
    'iPhone 15 128GB',
    'iphone',
    799,
    'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692937346745',
    TRUE,
    'El iPhone 15 con Dynamic Island y cámara de 48 MP.',
    '{"chip": "A16 Bionic", "pantalla": "6.1\" Super Retina XDR", "cámara": "48 MP Main", "batería": "Todo el día"}'
  ),
  (
    'ipad-air-m2-256gb',
    'iPad Air M2 256GB',
    'ipad',
    749,
    'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-air-select-wifi-blue-202405?wid=5120&hei=2880&fmt=p-jpg&qlt=80',
    FALSE,
    'El iPad Air más potente con chip M2.',
    '{"chip": "Apple M2", "pantalla": "11\" Liquid Retina", "almacenamiento": "256GB"}'
  ),
  (
    'macbook-air-m3-8gb-256gb',
    'MacBook Air M3 8GB 256GB',
    'mac',
    1099,
    'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303665',
    TRUE,
    'La notebook ultradelgada con el poderoso chip M3.',
    '{"chip": "Apple M3", "pantalla": "13.6\" Liquid Retina", "RAM": "8GB", "almacenamiento": "256GB SSD"}'
  ),
  (
    'apple-watch-series-9-41mm',
    'Apple Watch Series 9 41mm',
    'watch',
    399,
    'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQDY3ref_VW_34FR+watch-45-alum-midnight-nc-9s_VW_34FR_WF_CO?wid=700&hei=700&trim=1%2C0&fmt=p-jpg&qlt=95',
    FALSE,
    'El Apple Watch más inteligente con chip S9.',
    '{"chip": "S9", "pantalla": "41mm Always-On Retina", "resistencia": "WR50m"}'
  ),
  (
    'airpods-pro-2',
    'AirPods Pro 2da Gen',
    'airpods',
    249,
    'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=532&hei=582&fmt=jpeg&qlt=95',
    FALSE,
    'AirPods Pro con cancelación de ruido adaptativa.',
    '{"chip": "H2", "cancelación": "Activa adaptativa", "resistencia": "IP54"}'
  );

-- Valores plan canje
INSERT INTO trade_in_values (model, capacity, battery_state, value_usd) VALUES
  ('iPhone 13', '128GB', 'excelente', 320),
  ('iPhone 13', '128GB', 'bueno',     270),
  ('iPhone 13', '128GB', 'regular',   200),
  ('iPhone 13', '256GB', 'excelente', 370),
  ('iPhone 13', '256GB', 'bueno',     310),
  ('iPhone 13', '256GB', 'regular',   240),
  ('iPhone 13 Pro', '128GB', 'excelente', 420),
  ('iPhone 13 Pro', '128GB', 'bueno',     360),
  ('iPhone 13 Pro', '128GB', 'regular',   280),
  ('iPhone 14', '128GB', 'excelente', 480),
  ('iPhone 14', '128GB', 'bueno',     420),
  ('iPhone 14', '128GB', 'regular',   330),
  ('iPhone 14', '256GB', 'excelente', 530),
  ('iPhone 14', '256GB', 'bueno',     460),
  ('iPhone 14', '256GB', 'regular',   370),
  ('iPhone 14 Pro', '128GB', 'excelente', 580),
  ('iPhone 14 Pro', '128GB', 'bueno',     500),
  ('iPhone 14 Pro', '128GB', 'regular',   400),
  ('iPhone 15', '128GB', 'excelente', 620),
  ('iPhone 15', '128GB', 'bueno',     540),
  ('iPhone 15', '128GB', 'regular',   430);
