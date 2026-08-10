'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { ChainType, Offer, ShoppingListItem, SortOption, Store } from '@/lib/types';
import { getOffers, getStores, isSupabaseConfigured } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { OfferCard } from '@/components/OfferCard';
import { OfferModal } from '@/components/OfferModal';
import { ShoppingListModal } from '@/components/ShoppingListModal';
import { StoresView } from '@/components/StoresView';
import { SupabaseModal } from '@/components/SupabaseModal';
import { BottomNav } from '@/components/BottomNav';
import { EmptyState } from '@/components/EmptyState';
import { Sparkles, ArrowUpDown, Layers, ShoppingBag } from 'lucide-react';

export default function Home() {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<ChainType>('Alla');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alla');
  const [sortBy, setSortBy] = useState<SortOption>('best-price');

  // Data & Supabase Status
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLive, setIsLive] = useState<boolean>(isSupabaseConfigured);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Active Tabs
  const [selectedOfferModal, setSelectedOfferModal] = useState<Offer | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'offers' | 'list' | 'stores' | 'sql'>('offers');

  // Shopping List (with LocalStorage persistence)
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  // Debounce Search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load shopping list from LocalStorage on mount
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

  // Sync shopping list to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('matjakt_shopping_list', JSON.stringify(shoppingList));
    } catch (e) {
      console.warn('Could not save shopping list to localStorage', e);
    }
  }, [shoppingList]);

  // Fetch offers whenever filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getOffers({
      searchQuery: debouncedSearch,
      chain: selectedChain,
      category: selectedCategory,
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
  }, [debouncedSearch, selectedChain, selectedCategory, sortBy]);

  // Fetch stores directory once
  useEffect(() => {
    getStores().then((res) => {
      setStores(res.data);
    });
  }, []);

  // Shopping List Toggle & Quantity handlers
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
    setSelectedChain('Alla');
    setSelectedCategory('Alla');
    setSortBy('best-price');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-red-200 selection:text-red-900">
      {/* Sticky Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedChain={selectedChain}
        setSelectedChain={setSelectedChain}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isLive={isLive}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        totalResultsCount={offers.length}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {activeTab === 'stores' ? (
          <StoresView
            stores={stores}
            onSelectChain={(c) => {
              setSelectedChain(c);
              setActiveTab('offers');
            }}
          />
        ) : (
          <div>
            {/* Status & Results Summary Bar */}
            <div className="flex items-center justify-between py-2 mb-6 px-1 text-sm text-slate-500 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  {loading ? 'Hämtar erbjudanden...' : `${offers.length} resultat`}
                </span>
                {selectedChain !== 'Alla' && (
                  <span className="text-slate-500">
                    &bull; {selectedChain}
                  </span>
                )}
                {selectedCategory !== 'Alla' && (
                  <span className="text-slate-500">
                    &bull; {selectedCategory}
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

            {/* Loading Grid Skeleton */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-4 shadow-sm"
                  >
                    <div className="aspect-[4/3] w-full bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : offers.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                selectedChain={selectedChain}
                selectedCategory={selectedCategory}
                onResetFilters={handleResetFilters}
              />
            ) : (
              /* Offers Display */
              <div className="space-y-12">
                {/* If no active filters, show a curated feed layout */}
                {!searchQuery && selectedChain === 'Alla' && selectedCategory === 'Alla' ? (
                  <>
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-red-600" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Veckans bästa klipp</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                        {offers.slice(0, 4).map((offer) => (
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
                        {offers
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
                        {offers.slice(4).map((offer) => (
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
                  </>
                ) : (
                  /* Standard Grid for filtered results */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                    {offers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        onSelectOffer={(off) => setSelectedOfferModal(off)}
                        isInList={shoppingList.some((item) => item.offer.id === offer.id)}
                        onToggleShoppingList={handleToggleShoppingList}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Offer Detail Sheet/Modal */}
      <OfferModal
        offer={selectedOfferModal}
        onClose={() => setSelectedOfferModal(null)}
        isInList={Boolean(
          selectedOfferModal && shoppingList.some((it) => it.offer.id === selectedOfferModal.id)
        )}
        onToggleShoppingList={handleToggleShoppingList}
      />

      {/* Shopping List Modal */}
      <ShoppingListModal
        isOpen={activeTab === 'list'}
        onClose={() => setActiveTab('offers')}
        items={shoppingList}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearList={handleClearList}
      />

      {/* Supabase SQL Setup Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isLive={isLive}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shoppingListCount={shoppingList.length}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />
    </div>
  );
}
