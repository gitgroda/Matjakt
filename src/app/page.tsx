'use client';

import React, { useState, useEffect } from 'react';
import { Offer, ShoppingListItem, SortOption, Store } from '@/lib/types';
import { getOffers, getStores, isSupabaseConfigured } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { OfferCard } from '@/components/OfferCard';
import { OfferModal } from '@/components/OfferModal';
import { ShoppingListModal } from '@/components/ShoppingListModal';
import { StoresView } from '@/components/StoresView';
import { SupabaseModal } from '@/components/SupabaseModal';
import { BottomNav } from '@/components/BottomNav';
import { EmptyState } from '@/components/EmptyState';
import { Sparkles, Layers, ShoppingBag } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIcaStores, setSelectedIcaStores] = useState<string[]>([]);
  const [isMultiBuyOnly, setIsMultiBuyOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('best-price');

  const [offers, setOffers] = useState<Offer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLive, setIsLive] = useState<boolean>(isSupabaseConfigured);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedOfferModal, setSelectedOfferModal] = useState<Offer | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'offers' | 'list' | 'stores' | 'sql'>('offers');

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('matjakt_shopping_list');
      if (saved) {
        setShoppingList(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read shopping list from localStorage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('matjakt_shopping_list', JSON.stringify(shoppingList));
    } catch (e) {
      console.warn('Could not save shopping list to localStorage', e);
    }
  }, [shoppingList]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getOffers({
      searchQuery: debouncedSearch,
      sortBy: sortBy,
    }).then((res) => {
      if (isMounted) {
        setOffers(res.data);
        setIsLive(res.isLive);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, sortBy]);

  useEffect(() => {
    getStores().then((res) => {
      setStores(res.data);
    });
  }, []);

  const handleToggleShoppingList = (offer: Offer, e: React.MouseEvent) => {
    e.stopPropagation();
    setShoppingList((prev) => {
      const exists = prev.find((item) => item.offer.id === offer.id);
      if (exists) {
        return prev.filter((item) => item.offer.id !== offer.id);
      } else {
        return [
          ...prev,
          {
            offer,
            quantity: 1,
            addedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (offerId: string, delta: number) => {
    setShoppingList((prev) =>
      prev
        .map((item) => {
          if (item.offer.id === offerId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as ShoppingListItem[]
    );
  };

  const handleRemoveItem = (offerId: string) => {
    setShoppingList((prev) => prev.filter((item) => item.offer.id !== offerId));
  };

  const handleClearList = () => {
    setShoppingList([]);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedChains([]);
    setSelectedCategories([]);
    setSelectedIcaStores([]);
    setIsMultiBuyOnly(false);
    setSortBy('best-price');
  };

  const filteredOffers = offers.filter((offer) => {
    const isIca = offer.store?.chain === 'ICA';
    const hasSpecificIca = selectedIcaStores.length > 0;
    const hasChains = selectedChains.length > 0;
    
    let matchesChain = true;
    if (hasChains || hasSpecificIca) {
      if (isIca) {
         const inChains = selectedChains.includes('ICA');
         const inSpecific = offer.store ? selectedIcaStores.includes(offer.store.name) : false;
         matchesChain = (inChains && !hasSpecificIca) || inSpecific || (inChains && hasSpecificIca && inSpecific);
      } else {
         matchesChain = offer.store ? selectedChains.includes(offer.store.chain) : false;
      }
    }
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(offer.category);
    const matchesMultiBuy = !isMultiBuyOnly || (offer.price_unit && offer.price_unit.toLowerCase().includes('för'));
    
    return matchesChain && matchesCategory && matchesMultiBuy;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-red-200 selection:text-red-900">
      <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedChains={selectedChains}
          setSelectedChains={setSelectedChains}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedIcaStores={selectedIcaStores}
          setSelectedIcaStores={setSelectedIcaStores}
          isMultiBuyOnly={isMultiBuyOnly}
          setIsMultiBuyOnly={setIsMultiBuyOnly}
          stores={stores}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isLive={isLive}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        totalResultsCount={filteredOffers.length}
      />

      <main className="max-w-4xl mx-auto px-4 pt-6">
        {activeTab === 'stores' ? (
          <StoresView
            stores={stores}
            onSelectChain={(c) => {
              if (c !== 'Alla') {
                setSelectedChains([c]);
              } else {
                setSelectedChains([]);
              }
              setActiveTab('offers');
            }}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between py-2 mb-6 px-1 text-sm text-slate-500 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  {loading ? 'Hämtar erbjudanden...' : `${filteredOffers.length} resultat`}
                </span>
                {selectedChains.length > 0 && (
                  <span className="text-slate-500">
                    &bull; {selectedChains.join(', ')}
                  </span>
                )}
                {selectedCategories.length > 0 && (
                  <span className="text-slate-500">
                    &bull; {selectedCategories.join(', ')}
                  </span>
                )}
              </div>

              {shoppingList.length > 0 && (
                <button
                  onClick={() => setActiveTab('list')}
                  className="text-red-600 font-bold flex items-center gap-1.5 hover:underline bg-red-50 px-3 py-1.5 rounded-full"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Lista ({shoppingList.length})
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-4 shadow-sm">
                    <div className="aspect-[4/3] w-full bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredOffers.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                selectedChains={selectedChains}
                selectedCategories={selectedCategories}
                selectedIcaStores={selectedIcaStores}
                isMultiBuyOnly={isMultiBuyOnly}
                onClearFilters={handleResetFilters}
              />
            ) : (
              <div className="space-y-12">
                {!searchQuery && selectedChains.length === 0 && selectedCategories.length === 0 && selectedIcaStores.length === 0 && !isMultiBuyOnly ? (
                  <>
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-red-600" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Veckans bästa klipp</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                        {filteredOffers.slice(0, 4).map((offer) => (
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
                      <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Nytt från skafferiet & frukt</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                        {filteredOffers
                          .filter(o => o.category.includes('Skafferi') || o.category.includes('Frukt'))
                          .slice(0, 8)
                          .map((offer) => (
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
                        {filteredOffers.slice(4, visibleCount).map((offer) => (
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
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <OfferModal
        offer={selectedOfferModal}
        onClose={() => setSelectedOfferModal(null)}
        isInList={Boolean(
          selectedOfferModal && shoppingList.some((it) => it.offer.id === selectedOfferModal.id)
        )}
        onToggleShoppingList={handleToggleShoppingList}
      />

      <ShoppingListModal
        isOpen={activeTab === 'list'}
        onClose={() => setActiveTab('offers')}
        items={shoppingList}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearList={handleClearList}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isLive={isLive}
      />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shoppingListCount={shoppingList.length}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />
    </div>
  );
}
