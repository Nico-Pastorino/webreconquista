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

-- Valores plan canje (todos los modelos iPhone 12–17)
INSERT INTO trade_in_values (model, capacity, battery_state, value_usd) VALUES
  ('iPhone 12', '64GB', '100-90',   210),
  ('iPhone 12', '64GB', '89-70',    175),
  ('iPhone 12', '64GB', 'MENOS-70', 130),
  ('iPhone 12', '128GB', '100-90',   240),
  ('iPhone 12', '128GB', '89-70',    200),
  ('iPhone 12', '128GB', 'MENOS-70', 155),
  ('iPhone 12', '256GB', '100-90',   285),
  ('iPhone 12', '256GB', '89-70',    240),
  ('iPhone 12', '256GB', 'MENOS-70', 185),
  ('iPhone 12 mini', '64GB', '100-90',   185),
  ('iPhone 12 mini', '64GB', '89-70',    155),
  ('iPhone 12 mini', '64GB', 'MENOS-70', 115),
  ('iPhone 12 mini', '128GB', '100-90',   215),
  ('iPhone 12 mini', '128GB', '89-70',    180),
  ('iPhone 12 mini', '128GB', 'MENOS-70', 138),
  ('iPhone 12 mini', '256GB', '100-90',   255),
  ('iPhone 12 mini', '256GB', '89-70',    215),
  ('iPhone 12 mini', '256GB', 'MENOS-70', 165),
  ('iPhone 12 Pro', '128GB', '100-90',   300),
  ('iPhone 12 Pro', '128GB', '89-70',    255),
  ('iPhone 12 Pro', '128GB', 'MENOS-70', 195),
  ('iPhone 12 Pro', '256GB', '100-90',   345),
  ('iPhone 12 Pro', '256GB', '89-70',    295),
  ('iPhone 12 Pro', '256GB', 'MENOS-70', 230),
  ('iPhone 12 Pro', '512GB', '100-90',   400),
  ('iPhone 12 Pro', '512GB', '89-70',    340),
  ('iPhone 12 Pro', '512GB', 'MENOS-70', 265),
  ('iPhone 12 Pro Max', '128GB', '100-90',   330),
  ('iPhone 12 Pro Max', '128GB', '89-70',    280),
  ('iPhone 12 Pro Max', '128GB', 'MENOS-70', 215),
  ('iPhone 12 Pro Max', '256GB', '100-90',   375),
  ('iPhone 12 Pro Max', '256GB', '89-70',    320),
  ('iPhone 12 Pro Max', '256GB', 'MENOS-70', 248),
  ('iPhone 12 Pro Max', '512GB', '100-90',   435),
  ('iPhone 12 Pro Max', '512GB', '89-70',    370),
  ('iPhone 12 Pro Max', '512GB', 'MENOS-70', 290),
  ('iPhone 13', '128GB', '100-90',   320),
  ('iPhone 13', '128GB', '89-70',    270),
  ('iPhone 13', '128GB', 'MENOS-70', 200),
  ('iPhone 13', '256GB', '100-90',   370),
  ('iPhone 13', '256GB', '89-70',    310),
  ('iPhone 13', '256GB', 'MENOS-70', 240),
  ('iPhone 13', '512GB', '100-90',   425),
  ('iPhone 13', '512GB', '89-70',    360),
  ('iPhone 13', '512GB', 'MENOS-70', 280),
  ('iPhone 13 mini', '128GB', '100-90',   285),
  ('iPhone 13 mini', '128GB', '89-70',    240),
  ('iPhone 13 mini', '128GB', 'MENOS-70', 185),
  ('iPhone 13 mini', '256GB', '100-90',   330),
  ('iPhone 13 mini', '256GB', '89-70',    278),
  ('iPhone 13 mini', '256GB', 'MENOS-70', 215),
  ('iPhone 13 mini', '512GB', '100-90',   380),
  ('iPhone 13 mini', '512GB', '89-70',    320),
  ('iPhone 13 mini', '512GB', 'MENOS-70', 250),
  ('iPhone 13 Pro', '128GB', '100-90',   420),
  ('iPhone 13 Pro', '128GB', '89-70',    360),
  ('iPhone 13 Pro', '128GB', 'MENOS-70', 280),
  ('iPhone 13 Pro', '256GB', '100-90',   475),
  ('iPhone 13 Pro', '256GB', '89-70',    410),
  ('iPhone 13 Pro', '256GB', 'MENOS-70', 320),
  ('iPhone 13 Pro', '512GB', '100-90',   545),
  ('iPhone 13 Pro', '512GB', '89-70',    470),
  ('iPhone 13 Pro', '512GB', 'MENOS-70', 370),
  ('iPhone 13 Pro', '1TB', '100-90',   620),
  ('iPhone 13 Pro', '1TB', '89-70',    535),
  ('iPhone 13 Pro', '1TB', 'MENOS-70', 425),
  ('iPhone 13 Pro Max', '128GB', '100-90',   455),
  ('iPhone 13 Pro Max', '128GB', '89-70',    390),
  ('iPhone 13 Pro Max', '128GB', 'MENOS-70', 305),
  ('iPhone 13 Pro Max', '256GB', '100-90',   510),
  ('iPhone 13 Pro Max', '256GB', '89-70',    440),
  ('iPhone 13 Pro Max', '256GB', 'MENOS-70', 345),
  ('iPhone 13 Pro Max', '512GB', '100-90',   585),
  ('iPhone 13 Pro Max', '512GB', '89-70',    505),
  ('iPhone 13 Pro Max', '512GB', 'MENOS-70', 400),
  ('iPhone 13 Pro Max', '1TB', '100-90',   670),
  ('iPhone 13 Pro Max', '1TB', '89-70',    578),
  ('iPhone 13 Pro Max', '1TB', 'MENOS-70', 460),
  ('iPhone 14', '128GB', '100-90',   480),
  ('iPhone 14', '128GB', '89-70',    420),
  ('iPhone 14', '128GB', 'MENOS-70', 330),
  ('iPhone 14', '256GB', '100-90',   530),
  ('iPhone 14', '256GB', '89-70',    460),
  ('iPhone 14', '256GB', 'MENOS-70', 365),
  ('iPhone 14', '512GB', '100-90',   610),
  ('iPhone 14', '512GB', '89-70',    530),
  ('iPhone 14', '512GB', 'MENOS-70', 420),
  ('iPhone 14 Plus', '128GB', '100-90',   515),
  ('iPhone 14 Plus', '128GB', '89-70',    448),
  ('iPhone 14 Plus', '128GB', 'MENOS-70', 355),
  ('iPhone 14 Plus', '256GB', '100-90',   570),
  ('iPhone 14 Plus', '256GB', '89-70',    496),
  ('iPhone 14 Plus', '256GB', 'MENOS-70', 395),
  ('iPhone 14 Plus', '512GB', '100-90',   650),
  ('iPhone 14 Plus', '512GB', '89-70',    568),
  ('iPhone 14 Plus', '512GB', 'MENOS-70', 450),
  ('iPhone 14 Pro', '128GB', '100-90',   580),
  ('iPhone 14 Pro', '128GB', '89-70',    500),
  ('iPhone 14 Pro', '128GB', 'MENOS-70', 400),
  ('iPhone 14 Pro', '256GB', '100-90',   645),
  ('iPhone 14 Pro', '256GB', '89-70',    560),
  ('iPhone 14 Pro', '256GB', 'MENOS-70', 450),
  ('iPhone 14 Pro', '512GB', '100-90',   735),
  ('iPhone 14 Pro', '512GB', '89-70',    638),
  ('iPhone 14 Pro', '512GB', 'MENOS-70', 512),
  ('iPhone 14 Pro', '1TB', '100-90',   845),
  ('iPhone 14 Pro', '1TB', '89-70',    733),
  ('iPhone 14 Pro', '1TB', 'MENOS-70', 588),
  ('iPhone 14 Pro Max', '128GB', '100-90',   625),
  ('iPhone 14 Pro Max', '128GB', '89-70',    540),
  ('iPhone 14 Pro Max', '128GB', 'MENOS-70', 433),
  ('iPhone 14 Pro Max', '256GB', '100-90',   690),
  ('iPhone 14 Pro Max', '256GB', '89-70',    600),
  ('iPhone 14 Pro Max', '256GB', 'MENOS-70', 480),
  ('iPhone 14 Pro Max', '512GB', '100-90',   790),
  ('iPhone 14 Pro Max', '512GB', '89-70',    685),
  ('iPhone 14 Pro Max', '512GB', 'MENOS-70', 548),
  ('iPhone 14 Pro Max', '1TB', '100-90',   905),
  ('iPhone 14 Pro Max', '1TB', '89-70',    785),
  ('iPhone 14 Pro Max', '1TB', 'MENOS-70', 628),
  ('iPhone 15', '128GB', '100-90',   620),
  ('iPhone 15', '128GB', '89-70',    540),
  ('iPhone 15', '128GB', 'MENOS-70', 430),
  ('iPhone 15', '256GB', '100-90',   685),
  ('iPhone 15', '256GB', '89-70',    595),
  ('iPhone 15', '256GB', 'MENOS-70', 478),
  ('iPhone 15', '512GB', '100-90',   785),
  ('iPhone 15', '512GB', '89-70',    682),
  ('iPhone 15', '512GB', 'MENOS-70', 548),
  ('iPhone 15 Plus', '128GB', '100-90',   660),
  ('iPhone 15 Plus', '128GB', '89-70',    573),
  ('iPhone 15 Plus', '128GB', 'MENOS-70', 458),
  ('iPhone 15 Plus', '256GB', '100-90',   730),
  ('iPhone 15 Plus', '256GB', '89-70',    635),
  ('iPhone 15 Plus', '256GB', 'MENOS-70', 508),
  ('iPhone 15 Plus', '512GB', '100-90',   835),
  ('iPhone 15 Plus', '512GB', '89-70',    725),
  ('iPhone 15 Plus', '512GB', 'MENOS-70', 582),
  ('iPhone 15 Pro', '256GB', '100-90',   820),
  ('iPhone 15 Pro', '256GB', '89-70',    712),
  ('iPhone 15 Pro', '256GB', 'MENOS-70', 572),
  ('iPhone 15 Pro', '512GB', '100-90',   925),
  ('iPhone 15 Pro', '512GB', '89-70',    803),
  ('iPhone 15 Pro', '512GB', 'MENOS-70', 645),
  ('iPhone 15 Pro', '1TB', '100-90',   1065),
  ('iPhone 15 Pro', '1TB', '89-70',    923),
  ('iPhone 15 Pro', '1TB', 'MENOS-70', 742),
  ('iPhone 15 Pro Max', '256GB', '100-90',   885),
  ('iPhone 15 Pro Max', '256GB', '89-70',    768),
  ('iPhone 15 Pro Max', '256GB', 'MENOS-70', 618),
  ('iPhone 15 Pro Max', '512GB', '100-90',   990),
  ('iPhone 15 Pro Max', '512GB', '89-70',    858),
  ('iPhone 15 Pro Max', '512GB', 'MENOS-70', 692),
  ('iPhone 15 Pro Max', '1TB', '100-90',   1140),
  ('iPhone 15 Pro Max', '1TB', '89-70',    988),
  ('iPhone 15 Pro Max', '1TB', 'MENOS-70', 798),
  ('iPhone 16', '128GB', '100-90',   780),
  ('iPhone 16', '128GB', '89-70',    678),
  ('iPhone 16', '128GB', 'MENOS-70', 548),
  ('iPhone 16', '256GB', '100-90',   860),
  ('iPhone 16', '256GB', '89-70',    748),
  ('iPhone 16', '256GB', 'MENOS-70', 602),
  ('iPhone 16', '512GB', '100-90',   978),
  ('iPhone 16', '512GB', '89-70',    852),
  ('iPhone 16', '512GB', 'MENOS-70', 688),
  ('iPhone 16 Plus', '128GB', '100-90',   830),
  ('iPhone 16 Plus', '128GB', '89-70',    722),
  ('iPhone 16 Plus', '128GB', 'MENOS-70', 582),
  ('iPhone 16 Plus', '256GB', '100-90',   915),
  ('iPhone 16 Plus', '256GB', '89-70',    798),
  ('iPhone 16 Plus', '256GB', 'MENOS-70', 642),
  ('iPhone 16 Plus', '512GB', '100-90',   1045),
  ('iPhone 16 Plus', '512GB', '89-70',    908),
  ('iPhone 16 Plus', '512GB', 'MENOS-70', 732),
  ('iPhone 16 Pro', '256GB', '100-90',   1000),
  ('iPhone 16 Pro', '256GB', '89-70',    868),
  ('iPhone 16 Pro', '256GB', 'MENOS-70', 702),
  ('iPhone 16 Pro', '512GB', '100-90',   1120),
  ('iPhone 16 Pro', '512GB', '89-70',    972),
  ('iPhone 16 Pro', '512GB', 'MENOS-70', 788),
  ('iPhone 16 Pro', '1TB', '100-90',   1295),
  ('iPhone 16 Pro', '1TB', '89-70',    1122),
  ('iPhone 16 Pro', '1TB', 'MENOS-70', 908),
  ('iPhone 16 Pro Max', '256GB', '100-90',   1075),
  ('iPhone 16 Pro Max', '256GB', '89-70',    932),
  ('iPhone 16 Pro Max', '256GB', 'MENOS-70', 752),
  ('iPhone 16 Pro Max', '512GB', '100-90',   1200),
  ('iPhone 16 Pro Max', '512GB', '89-70',    1042),
  ('iPhone 16 Pro Max', '512GB', 'MENOS-70', 842),
  ('iPhone 16 Pro Max', '1TB', '100-90',   1385),
  ('iPhone 16 Pro Max', '1TB', '89-70',    1202),
  ('iPhone 16 Pro Max', '1TB', 'MENOS-70', 972),
  ('iPhone 17', '128GB', '100-90',   0),
  ('iPhone 17', '128GB', '89-70',    0),
  ('iPhone 17', '128GB', 'MENOS-70', 0),
  ('iPhone 17', '256GB', '100-90',   0),
  ('iPhone 17', '256GB', '89-70',    0),
  ('iPhone 17', '256GB', 'MENOS-70', 0),
  ('iPhone 17', '512GB', '100-90',   0),
  ('iPhone 17', '512GB', '89-70',    0),
  ('iPhone 17', '512GB', 'MENOS-70', 0),
  ('iPhone 17 Plus', '128GB', '100-90',   0),
  ('iPhone 17 Plus', '128GB', '89-70',    0),
  ('iPhone 17 Plus', '128GB', 'MENOS-70', 0),
  ('iPhone 17 Plus', '256GB', '100-90',   0),
  ('iPhone 17 Plus', '256GB', '89-70',    0),
  ('iPhone 17 Plus', '256GB', 'MENOS-70', 0),
  ('iPhone 17 Plus', '512GB', '100-90',   0),
  ('iPhone 17 Plus', '512GB', '89-70',    0),
  ('iPhone 17 Plus', '512GB', 'MENOS-70', 0),
  ('iPhone 17 Pro', '256GB', '100-90',   0),
  ('iPhone 17 Pro', '256GB', '89-70',    0),
  ('iPhone 17 Pro', '256GB', 'MENOS-70', 0),
  ('iPhone 17 Pro', '512GB', '100-90',   0),
  ('iPhone 17 Pro', '512GB', '89-70',    0),
  ('iPhone 17 Pro', '512GB', 'MENOS-70', 0),
  ('iPhone 17 Pro', '1TB', '100-90',   0),
  ('iPhone 17 Pro', '1TB', '89-70',    0),
  ('iPhone 17 Pro', '1TB', 'MENOS-70', 0),
  ('iPhone 17 Pro Max', '256GB', '100-90',   0),
  ('iPhone 17 Pro Max', '256GB', '89-70',    0),
  ('iPhone 17 Pro Max', '256GB', 'MENOS-70', 0),
  ('iPhone 17 Pro Max', '512GB', '100-90',   0),
  ('iPhone 17 Pro Max', '512GB', '89-70',    0),
  ('iPhone 17 Pro Max', '512GB', 'MENOS-70', 0),
  ('iPhone 17 Pro Max', '1TB', '100-90',   0),
  ('iPhone 17 Pro Max', '1TB', '89-70',    0),
  ('iPhone 17 Pro Max', '1TB', 'MENOS-70', 0);
