export const SUPABASE_SQL_SCHEMA = `-- =================================================================
-- MATJAKT UPPSALA - SUPABASE DATABASE SCHEMA & SEED DATA
-- Included Stores: ICA Maxi Stenhagen, ICA Maxi Gnista, ICA Rosendal, Willys, Hemköp
-- =================================================================

DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

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

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_price NUMERIC(10, 2),
    offer_price NUMERIC(10, 2) NOT NULL,
    price_unit TEXT NOT NULL DEFAULT 'kr/st',
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '6 days'),
    is_membership BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

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

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Allow public read access to offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Allow service insert access to stores" ON stores FOR ALL USING (true);
CREATE POLICY "Allow service insert access to offers" ON offers FOR ALL USING (true);

-- SEED UPPSALA STORES
INSERT INTO stores (id, name, chain, location, logo_url, address, opening_hours) VALUES
('11111111-1111-1111-1111-111111111111', 'ICA Maxi Stenhagen', 'ICA', 'Uppsala', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80', 'Herrhagsvägen 1, Uppsala', '06:00 - 23:00'),
('10041280-0000-0000-0000-000000000000', 'ICA Maxi Gnista', 'ICA', 'Uppsala', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80', 'Marknadsgatan 3, Uppsala', '06:00 - 23:00'),
('10046520-0000-0000-0000-000000000000', 'ICA Supermarket Rosendal', 'ICA', 'Uppsala', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80', 'Torgny Segerstedts allé 87, Uppsala', '07:00 - 22:00'),
('22222222-2222-2222-2222-222222222222', 'ICA Kvantum Gottsunda', 'ICA', 'Uppsala', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80', 'Gottsunda Centrum, Uppsala', '07:00 - 22:00'),
('44444444-4444-4444-4444-444444444444', 'Willys Uppsala Luthagen', 'Willys', 'Uppsala', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80', 'Rakuvägen 2, Uppsala', '08:00 - 21:00'),
('55555555-5555-5555-5555-555555555555', 'Willys Uppsala Gottsunda', 'Willys', 'Uppsala', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80', 'Valthornsvägen 7, Uppsala', '08:00 - 21:00'),
('66666666-6666-6666-6666-666666666666', 'Hemköp Svava Uppsala', 'Hemköp', 'Uppsala', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=80', 'Dragarbrunnsgatan 50, Uppsala', '07:00 - 22:00'),
('77777777-7777-7777-7777-777777777777', 'Hemköp Triangeln Uppsala', 'Hemköp', 'Uppsala', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=80', 'Kungsängsgatan 20, Uppsala', '08:00 - 21:00');

-- SEED INITIAL OFFERS
INSERT INTO offers (store_id, title, original_price, offer_price, price_unit, image_url, category, valid_from, valid_to, is_membership) VALUES
('10046520-0000-0000-0000-000000000000', 'Ekologisk Mjölk 1.5L Arla', 21.90, 14.90, 'kr/st', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', 'Mejeri & Ägg', CURRENT_DATE - 1, CURRENT_DATE + 5, true),
('10041280-0000-0000-0000-000000000000', 'Färsk Fläskfilé Svensk Scan', 129.00, 79.90, 'kr/kg', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80', 'Kött & Chark', CURRENT_DATE, CURRENT_DATE + 6, false),
('11111111-1111-1111-1111-111111111111', 'Färsk Laxfilé Norsk 4-pack', 149.00, 99.00, 'kr/st', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', 'Fisk & Skaldjur', CURRENT_DATE, CURRENT_DATE + 6, true),
('44444444-4444-4444-4444-444444444444', 'Svensk Blandfärs 500g Scan', 59.90, 39.90, 'kr/st', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80', 'Kött & Chark', CURRENT_DATE - 1, CURRENT_DATE + 5, false),
('66666666-6666-6666-6666-666666666666', 'Gevalia Bryggkaffe 450g', 58.90, 34.90, 'kr/st', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80', 'Skafferi', CURRENT_DATE - 2, CURRENT_DATE + 4, false);
`;
