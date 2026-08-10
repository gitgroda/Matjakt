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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner & Location */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-1.5">
              Matjakt
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Uppsala
              </span>
            </h1>
          </div>
        </div>

        {/* Supabase Status Pill */}
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
            isLive
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/80'
              : 'bg-amber-950/80 text-amber-300 border border-amber-700/50 hover:bg-amber-900/80'
          }`}
          title="Klicka för att se Supabase-status & SQL-skript"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isLive ? 'Supabase Live' : 'Demo (Klicka för SQL)'}</span>
          <span className="sm:hidden">{isLive ? 'Live' : 'SQL'}</span>
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
        </button>
      </div>

      {/* Sticky Search Bar */}
      <div className="max-w-4xl mx-auto px-4 pb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök kaffe, lax, jordgubbar, kyckling..."
            className="w-full pl-11 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chain Filter Pills (ICA, Willys, Hemköp) */}
      <div className="max-w-4xl mx-auto px-4 pb-2.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedChain('Alla')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedChain === 'Alla'
                ? 'bg-slate-100 text-slate-900 border-white shadow-md shadow-slate-100/10'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/70'
            }`}
          >
            Alla Kedjor
          </button>

          <button
            onClick={() => setSelectedChain('Willys')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              selectedChain === 'Willys'
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                : 'bg-slate-800/60 text-red-400 border-slate-700/60 hover:bg-red-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Willys
          </button>

          <button
            onClick={() => setSelectedChain('Hemköp')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              selectedChain === 'Hemköp'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-emerald-400 border-slate-700/60 hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Hemköp
          </button>

          <button
            onClick={() => setSelectedChain('ICA')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
              selectedChain === 'ICA'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                : 'bg-slate-800/60 text-rose-400 border-slate-700/60 hover:bg-rose-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            ICA
          </button>
        </div>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
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
