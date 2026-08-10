-- =================================================================
-- MATJAKT UPPSALA - SUPABASE DATABASE SCHEMA & SEED DATA
-- PostgreSQL schema with Full-Text Search (FTS) for grocery offers
-- =================================================================

-- 1. DROP EXISTING TABLES IF RE-INITIALIZING
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- 2. CREATE STORES TABLE
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    chain TEXT NOT NULL CHECK (chain IN ('ICA', 'Willys', 'Hemköp')),
    location TEXT NOT NULL DEFAULT 'Uppsala',
    logo_url TEXT,
    address TEXT,
    opening_hours TEXT DEFAULT '08:00 - 22:00',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE OFFERS TABLE
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_price NUMERIC(10, 2),
    offer_price NUMERIC(10, 2) NOT NULL,
    price_unit TEXT NOT NULL DEFAULT 'kr/st',
    compare_price TEXT,
    reference_price NUMERIC(10, 2),
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '6 days'),
    is_membership BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ADD FULL-TEXT SEARCH (FTS) COLUMN & GIN INDEX FOR SWEDISH SEARCH
ALTER TABLE offers 
ADD COLUMN fts tsvector 
GENERATED ALWAYS AS (
    to_tsvector('swedish', coalesce(title, '') || ' ' || coalesce(category, ''))
) STORED;

CREATE INDEX offers_fts_idx ON offers USING GIN(fts);
CREATE INDEX offers_store_id_idx ON offers(store_id);
CREATE INDEX offers_category_idx ON offers(category);
CREATE INDEX offers_valid_to_idx ON offers(valid_to);
CREATE INDEX offers_offer_price_idx ON offers(offer_price);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Allow public read access to offers" ON offers FOR SELECT USING (true);

-- 6. INSERT SEED STORES IN UPPSALA
INSERT INTO stores (id, name, chain, location, logo_url, address, opening_hours) VALUES
('11111111-1111-1111-1111-111111111111', 'ICA Maxi Stenhagen', 'ICA', 'Uppsala', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80', 'Herrhagsvägen 1, Uppsala', '06:00 - 23:00'),
('22222222-2222-2222-2222-222222222222', 'ICA Kvantum Gottsunda', 'ICA', 'Uppsala', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80', 'Gottsunda Centrum, Uppsala', '07:00 - 22:00'),
('33333333-3333-3333-3333-333333333333', 'ICA Supermarket Luthagens Livs', 'ICA', 'Uppsala', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80', 'Sysslomansgatan 14, Uppsala', '07:00 - 23:00'),
('44444444-4444-4444-4444-444444444444', 'Willys Uppsala Luthagen', 'Willys', 'Uppsala', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80', 'Rakuvägen 2, Uppsala', '08:00 - 21:00'),
('55555555-5555-5555-5555-555555555555', 'Willys Uppsala Gottsunda', 'Willys', 'Uppsala', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80', 'Valthornsvägen 7, Uppsala', '08:00 - 21:00'),
('66666666-6666-6666-6666-666666666666', 'Hemköp Svava Uppsala', 'Hemköp', 'Uppsala', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=80', 'Dragarbrunnsgatan 50, Uppsala', '07:00 - 22:00'),
('77777777-7777-7777-7777-777777777777', 'Hemköp Triangeln Uppsala', 'Hemköp', 'Uppsala', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=80', 'Kungsängsgatan 20, Uppsala', '08:00 - 21:00');

-- 7. INSERT SEED OFFERS FOR UPPSALA STORES
INSERT INTO offers (store_id, title, original_price, offer_price, price_unit, compare_price, reference_price, image_url, category, valid_from, valid_to, is_membership) VALUES
('44444444-4444-4444-4444-444444444444', 'Svensk Blandfärs 500g Scan', 59.90, 39.90, 'kr/st', '79.80 kr/kg', 45.90, 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80', 'Kött & Chark', CURRENT_DATE - 1, CURRENT_DATE + 5, false),
('11111111-1111-1111-1111-111111111111', 'Färsk Laxfilé Norsk 4-pack', 149.00, 99.00, 'kr/st', '198.00 kr/kg', 129.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', 'Fisk & Skaldjur', CURRENT_DATE, CURRENT_DATE + 6, true),
('66666666-6666-6666-6666-666666666666', 'Gevalia Bryggkaffe 450g', 58.90, 34.90, 'kr/st', '77.56 kr/kg', 39.90, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80', 'Skafferi', CURRENT_DATE - 2, CURRENT_DATE + 4, false),
('44444444-4444-4444-4444-444444444444', 'Bregott Normalspelt 500g Arla', 54.90, 39.90, 'kr/st', '79.80 kr/kg', 42.90, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80', 'Mejeri & Ägg', CURRENT_DATE - 1, CURRENT_DATE + 5, true),
('11111111-1111-1111-1111-111111111111', 'Svenska Jordgubbar 400g', 45.00, 25.00, 'kr/st', '62.50 kr/kg', 29.90, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80', 'Frukt & Grönt', CURRENT_DATE, CURRENT_DATE + 3, false),
('66666666-6666-6666-6666-666666666666', 'Svensk Kycklingfilé 1kg Kronfågel', 119.00, 79.90, 'kr/st', '79.90 kr/kg', 89.90, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80', 'Kött & Chark', CURRENT_DATE - 2, CURRENT_DATE + 4, true),
('22222222-2222-2222-2222-222222222222', 'Ekologiska Ägg 12-pack Stjärnägget', 42.90, 29.90, 'kr/st', '2.49 kr/st', 32.90, 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=600&q=80', 'Mejeri & Ägg', CURRENT_DATE - 1, CURRENT_DATE + 5, false),
('55555555-5555-5555-5555-555555555555', 'Avokado i Nät 700g', 39.90, 22.00, 'kr/st', '31.43 kr/kg', 25.00, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80', 'Frukt & Grönt', CURRENT_DATE, CURRENT_DATE + 6, false),
('77777777-7777-7777-7777-777777777777', 'Herrgårdsost 28% 700g Arla', 89.00, 59.90, 'kr/st', '85.57 kr/kg', 69.90, 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&q=80', 'Mejeri & Ägg', CURRENT_DATE - 3, CURRENT_DATE + 3, false),
('33333333-3333-3333-3333-333333333333', 'Pasta Barilla Spaghetti/Penne 500g', 24.90, 12.50, '2 för 25 kr', '25.00 kr/kg', 14.90, 'https://images.unsplash.com/photo-1621996346565-e3def6164286?w=600&q=80', 'Skafferi', CURRENT_DATE, CURRENT_DATE + 6, false),
('44444444-4444-4444-4444-444444444444', 'Pepsi Max / Zingo 1.5L 2-pack', 42.00, 25.00, '2 för 25 kr', '8.33 kr/L', 27.90, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80', 'Dryck & Godis', CURRENT_DATE - 1, CURRENT_DATE + 5, false),
('11111111-1111-1111-1111-111111111111', 'Marabou Mjölkchoklad 200g', 32.90, 19.90, 'kr/st', '99.50 kr/kg', 24.90, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80', 'Dryck & Godis', CURRENT_DATE, CURRENT_DATE + 6, true);
