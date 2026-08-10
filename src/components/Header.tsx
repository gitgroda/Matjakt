'use client';

import React from 'react';
import { Search, X, MapPin, Database, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ChainType, SortOption } from '@/lib/types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedChain: ChainType;
  setSelectedChain: (chain: ChainType) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  isLive: boolean;
  onOpenSupabaseModal: () => void;
  totalResultsCount: number;
}

const CATEGORIES = [
  'Alla',
  'Kött & Chark',
  'Mejeri & Ägg',
  'Frukt & Grönt',
  'Skafferi',
  'Fisk & Skaldjur',
  'Dryck & Godis',
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedChain,
  setSelectedChain,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  isLive,
  onOpenSupabaseModal,
  totalResultsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      {/* Top Banner & Location */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              Matjakt
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200 uppercase tracking-wide">
                Uppsala
              </span>
            </h1>
          </div>
        </div>

        {/* Supabase Status Pill */}
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all shadow-sm ${
            isLive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
          }`}
          title="Klicka för att se Supabase-status & SQL-skript"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isLive ? 'Live' : 'Demo (SQL)'}</span>
          <span className="sm:hidden">{isLive ? 'Live' : 'SQL'}</span>
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        </button>
      </div>

      {/* Sticky Search Bar */}
      <div className="max-w-4xl mx-auto px-4 pb-3 mt-1">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök kaffe, lax, jordgubbar..."
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chain Filter Pills */}
      <div className="max-w-4xl mx-auto px-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedChain('Alla')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              selectedChain === 'Alla'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Alla Kedjor
          </button>

          <button
            onClick={() => setSelectedChain('Willys')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              selectedChain === 'Willys'
                ? 'bg-red-600 text-white border-red-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
            }`}
          >
            Willys
          </button>

          <button
            onClick={() => setSelectedChain('Hemköp')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              selectedChain === 'Hemköp'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
            }`}
          >
            Hemköp
          </button>

          <button
            onClick={() => setSelectedChain('ICA')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              selectedChain === 'ICA'
                ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
            }`}
          >
            ICA
          </button>
        </div>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-lg px-2 shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent text-slate-700 font-semibold text-xs py-2 focus:outline-none cursor-pointer"
          >
            <option value="best-price">Bästa pris</option>
            <option value="discount">Störst rabatt %</option>
            <option value="ending-soon">Slutar snart</option>
            <option value="alphabetical">A–Ö</option>
          </select>
        </div>
      </div>
    </header>
  );
};
