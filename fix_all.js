const fs = require('fs');

// Fix Header.tsx
let header = fs.readFileSync('src/components/Header.tsx', 'utf-8');
header = header.replace('overflow-x-auto no-scrollbar ', 'flex-wrap ');
fs.writeFileSync('src/components/Header.tsx', header);

// Fix page.tsx
let page = fs.readFileSync('src/app/page.tsx', 'utf-8');
// Remove curated layout completely
page = page.replace(/\{!searchQuery && selectedChains\.length === 0[\s\S]*?<\/>\n\s*\) : \(/, '');
// Remove the trailing )} that matched the ternary
page = page.replace(/\{\s*filteredOffers\.slice\(0, visibleCount\)/, '{filteredOffers.slice(0, visibleCount)');
page = page.replace(/<\/div>\n\s*\}\)\n\s*<\/div>/, '</div>\n              </div>');
// Actually, it's safer to just replace the whole space-y-12 block
page = page.replace(/<div className="space-y-12">[\s\S]*?<\/main>/, 
`<div className="space-y-12">
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                    {filteredOffers.slice(0, visibleCount).map((offer) => (
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
                </div>
              </div>
            )}
          </div>
        )}
      </main>`);
fs.writeFileSync('src/app/page.tsx', page);
