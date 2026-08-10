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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans selection:bg-emerald-500 selection:text-slate-950">
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
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {/* Render Stores Tab */}
        {activeTab === 'stores' ? (
          <StoresView
            stores={stores}
            onSelectChain={(c) => {
              setSelectedChain(c);
              setActiveTab('offers');
            }}
          />
        ) : (
          /* Render Offers Feed */
          <div>
            {/* Status & Results Summary Bar */}
            <div className="flex items-center justify-between py-2 mb-3 px-1 text-xs text-slate-400 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">
                  {loading ? 'Söker erbjudanden...' : `${offers.length} erbjudanden i Uppsala`}
                </span>
                {selectedChain !== 'Alla' && (
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                    {selectedChain}
                  </span>
                )}
                {selectedCategory !== 'Alla' && (
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                    {selectedCategory}
                  </span>
                )}
              </div>

              {shoppingList.length > 0 && (
                <button
                  onClick={() => setActiveTab('list')}
                  className="text-emerald-400 font-extrabold flex items-center gap-1 hover:underline"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Visa lista ({shoppingList.length})
                </button>
              )}
            </div>

            {/* Loading Grid Skeleton */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800 animate-pulse space-y-3"
                  >
                    <div className="aspect-[4/3] w-full bg-slate-800 rounded-xl" />
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                    <div className="h-6 bg-slate-800 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : offers.length === 0 ? (
              /* Empty State */
              <EmptyState
                searchQuery={searchQuery}
                selectedChain={selectedChain}
                selectedCategory={selectedCategory}
                onResetFilters={handleResetFilters}
              />
            ) : (
              /* Offers Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
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
