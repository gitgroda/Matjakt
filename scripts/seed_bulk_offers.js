const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const url = 'https://yzwuakwknkyulupuopqj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d3Vha3drbmt5dWx1cHVvcHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNjU1MTgsImV4cCI6MjEwMTg0MTUxOH0.oCiaLZmb5bWI5q68QkH1ZWodb36UnVF6dCh-BnEj1oE';

const supabase = createClient(url, key, { realtime: { transport: ws } });

const UPPSALA_STORES = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'ICA Maxi Stenhagen', chain: 'ICA', location: 'Uppsala', address: 'Herrhagsvägen 1, Uppsala', logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80' },
  { id: '10041280-0000-0000-0000-000000000000', name: 'ICA Maxi Gnista', chain: 'ICA', location: 'Uppsala', address: 'Marknadsgatan 3, Uppsala', logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80' },
  { id: '10046520-0000-0000-0000-000000000000', name: 'ICA Supermarket Rosendal', chain: 'ICA', location: 'Uppsala', address: 'Torgny Segerstedts allé 87, Uppsala', logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'ICA Kvantum Gottsunda', chain: 'ICA', location: 'Uppsala', address: 'Gottsunda Centrum, Uppsala', logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Willys Uppsala Luthagen', chain: 'Willys', location: 'Uppsala', address: 'Rakuvägen 2, Uppsala', logo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Willys Uppsala Gottsunda', chain: 'Willys', location: 'Uppsala', address: 'Valthornsvägen 7, Uppsala', logo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Hemköp Svava Uppsala', chain: 'Hemköp', location: 'Uppsala', address: 'Dragarbrunnsgatan 50, Uppsala', logo_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=80' },
  { id: '77777777-7777-7777-7777-777777777777', name: 'Hemköp Triangeln Uppsala', chain: 'Hemköp', location: 'Uppsala', address: 'Kungsängsgatan 20, Uppsala', logo_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=80' }
];

const FULL_CATALOG = [
  { title: 'Svensk Blandfärs 500g Scan', orig: 59.90, offer: 39.90, unit: 'kr/st', cat: 'Kött & Chark', img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80', mem: false },
  { title: 'Svensk Kycklingfilé 1kg Kronfågel', orig: 119.00, offer: 79.90, unit: 'kr/st', cat: 'Kött & Chark', img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80', mem: true },
  { title: 'Fläskytterfilé Svensk 1kg Scan', orig: 99.00, offer: 69.90, unit: 'kr/kg', cat: 'Kött & Chark', img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80', mem: false },
  { title: 'Bacon 3-pack 420g Tulip', orig: 44.90, offer: 29.90, unit: 'kr/st', cat: 'Kött & Chark', img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80', mem: false },
  { title: 'Falukorv 800g Scan', orig: 49.90, offer: 34.90, unit: 'kr/st', cat: 'Kött & Chark', img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80', mem: true },
  { title: 'Grillkorv 900g Lithells', orig: 54.90, offer: 39.90, unit: 'kr/st', cat: 'Kött & Chark', img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80', mem: false },
  { title: 'Bregott Normalspelt 500g Arla', orig: 54.90, offer: 39.90, unit: 'kr/st', cat: 'Mejeri & Ägg', img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80', mem: true },
  { title: 'Ekologiska Ägg 12-pack Stjärnägget', orig: 42.90, offer: 29.90, unit: 'kr/st', cat: 'Mejeri & Ägg', img: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=600&q=80', mem: false },
  { title: 'Herrgårdsost 28% 700g Arla', orig: 89.00, offer: 59.90, unit: 'kr/st', cat: 'Mejeri & Ägg', img: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&q=80', mem: false },
  { title: 'Arla Vispgrädde 36% 5dl', orig: 29.90, offer: 19.90, unit: 'kr/st', cat: 'Mejeri & Ägg', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', mem: false },
  { title: 'Arla Mjölk 1.5L Standard/Mellan', orig: 21.90, offer: 14.90, unit: 'kr/st', cat: 'Mejeri & Ägg', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', mem: true },
  { title: 'Grekisk Yoghurt 1kg Salakis', orig: 37.90, offer: 24.90, unit: 'kr/st', cat: 'Mejeri & Ägg', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', mem: false },
  { title: 'Oatly Havredryck 1L', orig: 22.90, offer: 14.90, unit: 'kr/st', cat: 'Mejeri & Ägg', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', mem: false },
  { title: 'Svenska Jordgubbar 400g', orig: 45.00, offer: 25.00, unit: 'kr/st', cat: 'Frukt & Grönt', img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80', mem: false },
  { title: 'Avokado i Nät 700g Premium', orig: 39.90, offer: 22.00, unit: 'kr/st', cat: 'Frukt & Grönt', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80', mem: false },
  { title: 'Färska Tomater i Kvist 1kg', orig: 39.90, offer: 24.90, unit: 'kr/kg', cat: 'Frukt & Grönt', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', mem: false },
  { title: 'Svenska Äpplen Ingrid Marie 1kg', orig: 32.90, offer: 19.90, unit: 'kr/kg', cat: 'Frukt & Grönt', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80', mem: false },
  { title: 'Gurka Svensk 1st', orig: 18.90, offer: 10.00, unit: 'kr/st', cat: 'Frukt & Grönt', img: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80', mem: true },
  { title: 'Bananer Eko Fairtrade 1kg', orig: 28.90, offer: 19.90, unit: 'kr/kg', cat: 'Frukt & Grönt', img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', mem: false },
  { title: 'Svensk Potatis 2kg Påse', orig: 34.90, offer: 19.90, unit: 'kr/st', cat: 'Frukt & Grönt', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80', mem: false },
  { title: 'Gevalia Bryggkaffe 450g', orig: 58.90, offer: 34.90, unit: 'kr/st', cat: 'Skafferi', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80', mem: false },
  { title: 'Zoégas Skånerost 450g', orig: 64.90, offer: 39.90, unit: 'kr/st', cat: 'Skafferi', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80', mem: true },
  { title: 'Pasta Barilla Spaghetti 500g', orig: 24.90, offer: 12.50, unit: '2 för 25 kr', cat: 'Skafferi', img: 'https://images.unsplash.com/photo-1621996346565-e3def6164286?w=600&q=80', mem: false },
  { title: 'Krossade Tomater 400g Mutti', orig: 19.90, offer: 12.90, unit: 'kr/st', cat: 'Skafferi', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', mem: false },
  { title: 'Olivolja Extra Virgin 500ml Zeta', orig: 99.00, offer: 69.90, unit: 'kr/st', cat: 'Skafferi', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80', mem: true },
  { title: 'Basmatiris 1kg Sevan', orig: 44.90, offer: 29.90, unit: 'kr/st', cat: 'Skafferi', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80', mem: false },
  { title: 'Havregryn 1kg Kungsörnen', orig: 22.90, offer: 14.90, unit: 'kr/st', cat: 'Skafferi', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80', mem: false },
  { title: 'Färsk Laxfilé Norsk 4-pack', orig: 149.00, offer: 99.00, unit: 'kr/st', cat: 'Fisk & Skaldjur', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', mem: true },
  { title: 'Laxportioner Frysta 4x125g', orig: 99.00, offer: 69.90, unit: 'kr/st', cat: 'Fisk & Skaldjur', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80', mem: false },
  { title: 'Handskalade Räkor i Lake 280g', orig: 89.00, offer: 59.90, unit: 'kr/st', cat: 'Fisk & Skaldjur', img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80', mem: false },
  { title: 'Torskfilé Fryst 400g Findus', orig: 74.90, offer: 49.90, unit: 'kr/st', cat: 'Fisk & Skaldjur', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', mem: false },
  { title: 'Pepsi Max / Zingo 1.5L 2-pack', orig: 42.00, offer: 25.00, unit: '2 för 25 kr', cat: 'Dryck & Godis', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80', mem: false },
  { title: 'Marabou Mjölkchoklad 200g', orig: 32.90, offer: 19.90, unit: 'kr/st', cat: 'Dryck & Godis', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80', mem: true },
  { title: 'OLW Cheez Doodles 225g', orig: 29.90, offer: 19.90, unit: 'kr/st', cat: 'Dryck & Godis', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80', mem: false },
  { title: 'Coca-Cola Zero 6x33ml burk', orig: 54.90, offer: 39.90, unit: 'kr/st', cat: 'Dryck & Godis', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80', mem: false }
];

async function seedBulk() {
  console.log('Clearing old offers & inserting 25+ offers per store into Supabase...');
  const validFrom = new Date().toISOString().split('T')[0];
  const validTo = new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0];

  for (const st of UPPSALA_STORES) {
    const { error: sErr } = await supabase.from('stores').upsert(st);
    if (sErr) console.error('Store error:', st.name, sErr.message);
  }

  // Clear existing offers
  const { error: delErr } = await supabase.from('offers').delete().filter('offer_price', 'gt', 0);
  if (delErr) console.warn('Delete error:', delErr.message);

  let totalCount = 0;
  for (let sIdx = 0; sIdx < UPPSALA_STORES.length; sIdx++) {
    const store = UPPSALA_STORES[sIdx];
    const storeOffers = FULL_CATALOG.map((prod, pIdx) => ({
      store_id: store.id,
      title: prod.title,
      original_price: prod.orig,
      offer_price: Number((prod.offer * (1 + (sIdx % 3) * 0.01)).toFixed(2)),
      price_unit: prod.unit,
      compare_price: (prod.orig * 1.2).toFixed(2) + ' kr/' + (prod.unit === 'kr/st' ? 'st' : 'kg'),
      reference_price: Number((prod.offer * 1.1).toFixed(2)),
      image_url: prod.img,
      category: prod.cat,
      valid_from: validFrom,
      valid_to: new Date(Date.now() + (5 + (pIdx % 3)) * 86400000).toISOString().split('T')[0],
      is_membership: prod.mem
    }));

    const { data: inserted, error: iErr } = await supabase.from('offers').insert(storeOffers).select('id');
    if (iErr) console.error('Insert error for ' + store.name + ':', iErr.message);
    else {
      const count = inserted?.length || storeOffers.length;
      totalCount += count;
      console.log('✓ Inserted ' + count + ' offers for ' + store.name);
    }
  }

  const { data: countCheck } = await supabase.from('offers').select('id');
  console.log('🎉 TOTAL OFFERS IN LIVE SUPABASE DATABASE:', countCheck?.length);
}

seedBulk();
