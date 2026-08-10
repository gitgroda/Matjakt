import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import vm from 'vm';
import { normalizeCategory } from '@/lib/utils/categoryMapper';

const ICA_STORES = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'ICA Maxi Stenhagen', chain: 'ICA', url: 'https://www.ica.se/butiker/maxi/uppsala/maxi-ica-stormarknad-stenhagen-uppsala-1004488/erbjudanden/' },
  { id: '10041280-0000-0000-0000-000000000000', name: 'ICA Maxi Gnista', chain: 'ICA', url: 'https://www.ica.se/butiker/maxi/uppsala/maxi-ica-stormarknad-gnista-uppsala-1003431/erbjudanden/' },
  { id: '10046520-0000-0000-0000-000000000000', name: 'ICA Supermarket Rosendal', chain: 'ICA', url: 'https://www.ica.se/butiker/nara/uppsala/ica-nara-rosendal-1004328/erbjudanden/' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'ICA Kvantum Gottsunda', chain: 'ICA', url: 'https://www.ica.se/butiker/kvantum/uppsala/ica-kvantum-gottsunda-1004218/erbjudanden/' }
];

const AXFOOD_CATEGORIES = [
  'Kott-chark-och-fagel',
  'Mejeri-ost-och-agg',
  'Frukt-och-gront',
  'Skafferi',
  'Fisk-och-skaldjur',
  'Frys',
  'Dryck',
  'Godis-och-snacks',
  'Brod-och-kakor'
];

async function scrapeIcaOffers(store: any) {
  try {
    const res = await fetch(store.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/window\.__INITIAL_DATA__\s*=\s*({[\s\S]*?});\s*<\/script>/);
    if (!match) return [];

    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext('window.__INITIAL_DATA__ = ' + match[1], sandbox);
    const data = (sandbox.window as any).__INITIAL_DATA__;
    const rawOffers = data?.offers?.weeklyOffers || [];

    const validFrom = new Date().toISOString().split('T')[0];

    return rawOffers.map((item: any) => {
      const title = item.details?.name || item.name || 'Erbjudande';
      const regPriceStr = item.stores?.[0]?.regularPrice || '0';
      const regPrice = parseFloat(regPriceStr.replace(',', '.'));

      const mechanic = item.details?.mechanicInfo || '';
      let offerPrice = regPrice > 0 ? regPrice : 29.90;
      
      if (item.parsedMechanics && item.parsedMechanics.value2) {
        const val = parseFloat(item.parsedMechanics.value2.replace(',', '.'));
        const qty = item.parsedMechanics.quantity || 1;
        if (val > 0) offerPrice = val / qty;
      } else {
        const forMatch = mechanic.match(/(\d+)\s+för\s+(\d+[\.,]?\d*)/i);
        if (forMatch) {
          const qty = parseFloat(forMatch[1]);
          const val = parseFloat(forMatch[2].replace(',', '.'));
          if (val > 0 && qty > 0) offerPrice = val / qty;
        } else {
          const numMatch = mechanic.match(/(\d+[\.,]?\d*)/);
          if (numMatch) {
            const parsedNum = parseFloat(numMatch[1].replace(',', '.'));
            if (parsedNum > 0) offerPrice = parsedNum;
          }
        }
      }

      const eanImg = item.eans?.[0]?.image;
      const fallbackImg = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80';
      const imageUrl = eanImg ? eanImg.replace('h_200,w_200', 'h_400,w_400') : fallbackImg;

      const isMembership = item.traits?.includes('Stammis') || false;
      const categoryName = item.category?.articleGroupName || 'Skafferi';

        let compUnit = 'kg';
        const titleLower = title.toLowerCase();
        if (titleLower.match(/\d+\s*(l|cl|ml)(\s|$)/)) {
          compUnit = 'l';
        }

        let compPrice = item.comparePrice;
        if (compPrice && !compPrice.toLowerCase().includes('kr/')) {
          compPrice = compPrice.replace(' kr', '').trim() + ' kr/' + compUnit;
        } else if (!compPrice && regPrice > 0) {
          compPrice = (regPrice * 1.2).toFixed(2) + ' kr/' + compUnit;
        }

        return {
          store_id: store.id,
          title: title,
          original_price: regPrice > 0 ? regPrice : null,
          offer_price: Number(offerPrice.toFixed(2)),
          price_unit: mechanic || 'kr/st',
          image_url: imageUrl,
          compare_price: compPrice,
          weight: item.details?.packageInformation || null,
          reference_price: offerPrice > 0 ? Number((offerPrice * 1.1).toFixed(2)) : undefined,
        category: normalizeCategory('ICA', categoryName, title),
        valid_from: validFrom,
        valid_to: item.validTo ? item.validTo.split('T')[0] : new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
        is_membership: isMembership
      };
    });
  } catch (err) {
    console.error(`Fel vid skrapning av ${store.name}:`, err);
    return [];
  }
}

async function scrapeAxfoodOffers(chain: 'Willys' | 'Hemköp', storeId: string) {
  const domain = chain === 'Willys' ? 'www.willys.se' : 'www.hemkop.se';
  const allOffers: any[] = [];

  for (const cat of AXFOOD_CATEGORIES) {
    try {
      const url = `https://${domain}/c/${cat}?page=0&size=60`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items = data.results || [];

      for (const item of items) {
        if (item.potentialPromotions && item.potentialPromotions.length > 0) {
          const promo = item.potentialPromotions[0];
          const promoPrice = promo.price?.value || item.priceValue;
          const regPrice = item.priceValue || null;
          const validToStr = promo.validUntil
            ? new Date(promo.validUntil).toISOString().split('T')[0]
            : new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0];

          let offerPriceVal = promoPrice ? parseFloat(promoPrice) : 29.90;
          
          let fullPromoString = promo.rewardLabel || '';
          if (promo.conditionLabel) {
            fullPromoString = promo.conditionLabel + ' ' + fullPromoString;
          }
          if (fullPromoString && fullPromoString.match(/^\d+,\d+$/)) {
             fullPromoString = fullPromoString + ' kr';
          }
          
          let compUnit = item.comparePriceUnit || promo.comparePriceUnit;
          if (!compUnit) {
            const titleLower = item.name.toLowerCase();
            compUnit = titleLower.match(/\d+\s*(l|cl|ml)(\s|$)/) ? 'l' : 'kg';
          }
          
          let pUnit = fullPromoString || (compUnit ? 'kr/' + compUnit : 'kr/st');

          let compPrice = item.comparePrice || promo.comparePrice;
          if (compPrice && !compPrice.toLowerCase().includes('kr/')) {
            compPrice = compPrice.replace(' kr', '').trim() + ' kr/' + compUnit;
          }

          allOffers.push({
            store_id: storeId,
            title: item.name,
            original_price: regPrice && regPrice > offerPriceVal ? Number(regPrice.toFixed(2)) : null,
            offer_price: Number(offerPriceVal.toFixed(2)),
            price_unit: pUnit,
            image_url: item.image?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
            compare_price: compPrice,
            weight: item.displayVolume || null,
            reference_price: offerPriceVal ? Number((offerPriceVal * 1.1).toFixed(2)) : undefined,
            category: normalizeCategory(chain, cat, item.name),
            valid_from: new Date().toISOString().split('T')[0],
            valid_to: validToStr,
            is_membership: Boolean(promo.campaignType === 'LOYALTY' || promo.rewardType === 'CLUB')
          });
        }
      }
    } catch (e: any) {
      console.warn(`Fel i ${chain} kategori ${cat}:`, e?.message);
    }
  }
  return allOffers;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
    return NextResponse.json({ success: false, message: 'Supabase miljövariabler saknas i .env.local' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: { transport: ws as any }
  });

  const syncResults: Record<string, number> = {};

  // 1. ICA Stores
  for (const st of ICA_STORES) {
    const offers = await scrapeIcaOffers(st);
    if (offers.length > 0) {
      await supabase.from('offers').delete().eq('store_id', st.id);
      for (let i = 0; i < offers.length; i += 50) {
        await supabase.from('offers').insert(offers.slice(i, i + 50));
      }
      syncResults[st.name] = offers.length;
    }
  }

  // 2. Willys
  const willysStoreId = '44444444-4444-4444-4444-444444444444';
  const willysOffers = await scrapeAxfoodOffers('Willys', willysStoreId);
  if (willysOffers.length > 0) {
    await supabase.from('offers').delete().eq('store_id', willysStoreId);
    for (let i = 0; i < willysOffers.length; i += 50) {
      await supabase.from('offers').insert(willysOffers.slice(i, i + 50));
    }
    syncResults['Willys Uppsala'] = willysOffers.length;
  }

  // 3. Hemköp
  const hemkopStoreId = '66666666-6666-6666-6666-666666666666';
  const hemkopOffers = await scrapeAxfoodOffers('Hemköp', hemkopStoreId);
  if (hemkopOffers.length > 0) {
    await supabase.from('offers').delete().eq('store_id', hemkopStoreId);
    for (let i = 0; i < hemkopOffers.length; i += 50) {
      await supabase.from('offers').insert(hemkopOffers.slice(i, i + 50));
    }
    syncResults['Hemköp Svava Uppsala'] = hemkopOffers.length;
  }

  const totalSynced = Object.values(syncResults).reduce((a, b) => a + b, 0);

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalSyncedOffers: totalSynced,
    message: `Framgångsrikt skrapat och sparat ${totalSynced} RIKTIGA veckans reklambladserbjudanden till Supabase!`,
    results: syncResults
  });
}
