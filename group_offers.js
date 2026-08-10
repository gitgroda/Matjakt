const fs = require('fs');

let page = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Replace sort and add deduplication logic
const groupLogic = `
  filteredOffers.sort((a, b) => {
    const discountA = a.original_price ? (a.original_price - a.offer_price) / a.original_price : 0;
    const discountB = b.original_price ? (b.original_price - b.offer_price) / b.original_price : 0;
    return discountB - discountA;
  });

  const deduplicatedOffers: Offer[] = [];
  const icaMap = new Map<string, Offer>();

  for (const offer of filteredOffers) {
    if (offer.store?.chain === 'ICA') {
      const key = offer.title + '|' + offer.offer_price;
      if (icaMap.has(key)) {
        const existing = icaMap.get(key)!;
        if (existing.store && offer.store) {
          if (!existing.store.allStoreNames) {
            existing.store.allStoreNames = [existing.store.name];
          }
          if (!existing.store.allStoreNames.includes(offer.store.name)) {
            existing.store.allStoreNames.push(offer.store.name);
          }
        }
      } else {
        // Deep copy so we don't mutate the original fetched object
        const newOffer = { ...offer, store: offer.store ? { ...offer.store, allStoreNames: [offer.store.name] } : undefined };
        icaMap.set(key, newOffer);
        deduplicatedOffers.push(newOffer);
      }
    } else {
      deduplicatedOffers.push(offer);
    }
  }
`;

page = page.replace(/filteredOffers\.sort\(\(a, b\) => \{[\s\S]*?\}\);\n\n/, groupLogic + '\n');

// Replace filteredOffers with deduplicatedOffers in the render part
page = page.replace(/filteredOffers\.length/g, 'deduplicatedOffers.length');
// For the curated section:
page = page.replace(/\{filteredOffers\.slice\(0, 32\)\.map/g, "{deduplicatedOffers.filter(o => !['Hem & Hushåll', 'Hälsa & Hygien', 'Övrigt'].includes(o.category)).slice(0, 32).map");
page = page.replace(/\{filteredOffers\.slice\(32, visibleCount\)\.map/g, "{deduplicatedOffers.slice(32, visibleCount).map");
// For the standard grid:
page = page.replace(/\{filteredOffers\.slice\(0, visibleCount\)\.map/g, "{deduplicatedOffers.slice(0, visibleCount).map");

fs.writeFileSync('src/app/page.tsx', page);
