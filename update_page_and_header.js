const fs = require('fs');

// 1. Update Header.tsx
let header = fs.readFileSync('src/components/Header.tsx', 'utf-8');
// Remove sortBy from props
header = header.replace(/sortBy:\s*SortOption;\n\s*setSortBy:\s*\(sort:\s*SortOption\)\s*=>\s*void;\n/, '');
header = header.replace(/sortBy,\s*setSortBy,/, '');
// Remove the select element and its container
header = header.replace(/<div className="flex items-center gap-1\.5 shrink-0 bg-white border border-slate-200 rounded-none px-2 shadow-sm">[\s\S]*?<\/div>/, '');
fs.writeFileSync('src/components/Header.tsx', header);

// 2. Update page.tsx
let page = fs.readFileSync('src/app/page.tsx', 'utf-8');
// Remove sortBy state
page = page.replace(/const \[sortBy, setSortBy\] = useState<SortOption>\('best-price'\);\n/, '');
page = page.replace(/sortBy,\n\s*/, '');
page = page.replace(/sortBy={sortBy}\n\s*setSortBy={setSortBy}\n/, '');
page = page.replace(/setSortBy\('best-price'\);\n/, '');
// Make getOffers not depend on sortBy
page = page.replace(/, sortBy\]\)/, '])');

// Add sorting to filteredOffers
const sortLogic = `
  filteredOffers.sort((a, b) => {
    const discountA = a.original_price ? (a.original_price - a.offer_price) / a.original_price : 0;
    const discountB = b.original_price ? (b.original_price - b.offer_price) / b.original_price : 0;
    return discountB - discountA;
  });
`;
page = page.replace(/return matchesSearch && matchesChain && matchesCategory && matchesMultiBuy;\n\s*\}\);/, `return matchesSearch && matchesChain && matchesCategory && matchesMultiBuy;
  });
${sortLogic}`);

// Add "Veckans bästa klipp" back if no filters
// It should show 32 items.
const curatedLayout = `
                {!searchQuery && selectedChains.length === 0 && selectedCategories.length === 0 && selectedIcaStores.length === 0 && !isMultiBuyOnly ? (
                  <>
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-red-600" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Veckans bästa klipp</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                        {filteredOffers.slice(0, 32).map((offer) => (
                          <OfferCard
                            key={offer.id}
                            offer={offer}
                            onSelectOffer={(off) => setSelectedOfferModal(off)}
                            isInList={shoppingList.some((item) => item.offer.id === offer.id)}
                            onToggleShoppingList={handleToggleShoppingList}
                          />
                        ))}
                      </div>
                    </section>
                    <section>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">Fler erbjudanden</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                        {filteredOffers.slice(32, visibleCount).map((offer) => (
                          <OfferCard
                            key={offer.id}
                            offer={offer}
                            onSelectOffer={(off) => setSelectedOfferModal(off)}
                            isInList={shoppingList.some((item) => item.offer.id === offer.id)}
                            onToggleShoppingList={handleToggleShoppingList}
                          />
                        ))}
                      </div>
                      {visibleCount < filteredOffers.length && (
                        <div className="mt-12 flex justify-center">
                          <button
                            onClick={() => setVisibleCount(v => v + 60)}
                            className="bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold py-3.5 px-8 rounded-2xl transition-all shadow-sm"
                          >
                            Visa fler erbjudanden
                          </button>
                        </div>
                      )}
                    </section>
                  </>
                ) : (
`;
page = page.replace(/<div className="space-y-12">\n\s*<div>/, `<div className="space-y-12">${curatedLayout}\n                <div>`);
page = page.replace(/<\/div>\n\s*\}\)\n\s*<\/div>/, `</div>\n                )}`); // Need to be careful with brackets

fs.writeFileSync('src/app/page.tsx', page);
