import React from 'react';
import { Search, MapPin, Database, Sparkles, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { SortOption, Store } from '@/lib/types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedChains: string[];
  setSelectedChains: (c: any) => void;
  selectedCategories: string[];
  setSelectedCategories: (c: any) => void;
  selectedIcaStores: string[];
  setSelectedIcaStores: (c: any) => void;
  isMultiBuyOnly: boolean;
  setIsMultiBuyOnly: (v: any) => void;
  stores: Store[];
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  isLive: boolean;
  onOpenSupabaseModal: () => void;
  totalResultsCount: number;
}

const CATEGORIES = [
  'Kött, fågel & fläsk',
  'Chark & Färdigmat',
  'Mejeri & Ägg',
  'Frukt & Grönt',
  'Skafferi',
  'Fisk & Skaldjur',
  'Dryck & Godis',
];
const CHAINS = ['ICA', 'Willys', 'Hemköp'];

export const Header: React.FC<HeaderProps> = ({
  searchQuery, setSearchQuery,
  selectedChains, setSelectedChains,
  selectedCategories, setSelectedCategories,
  selectedIcaStores, setSelectedIcaStores,
  isMultiBuyOnly, setIsMultiBuyOnly,
  stores,
  sortBy, setSortBy,
  isLive, onOpenSupabaseModal, totalResultsCount
}) => {
  const toggleChain = (c: string) => setSelectedChains((prev: string[]) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleCategory = (c: string) => setSelectedCategories((prev: string[]) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleIcaStore = (c: string) => setSelectedIcaStores((prev: string[]) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const icaStores = stores.filter(s => s.chain === 'ICA').sort((a, b) => a.name.localeCompare(b.name));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
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
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {totalResultsCount} träffar
          </div>
          <button onClick={onOpenSupabaseModal} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all shadow-sm ${isLive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'}`}>
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isLive ? 'Live' : 'Demo'}</span>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Sök erbjudanden..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-100 text-slate-900 font-semibold rounded-none pl-11 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:bg-white transition-all shadow-inner border border-slate-200" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="relative group z-50">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors rounded-none">
              Butiker
              {(selectedChains.length + selectedIcaStores.length) > 0 && <span className="bg-red-600 text-white text-[10px] w-4 h-4 rounded-none flex items-center justify-center">{selectedChains.length + selectedIcaStores.length}</span>}
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </button>
            <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[240px]">
              <div className="bg-white border border-slate-200 shadow-xl p-3 flex flex-col gap-2 rounded-none max-h-[70vh] overflow-y-auto">
                {CHAINS.map(chain => (
                  <label key={chain} className="flex items-center gap-2 cursor-pointer group/label">
                    <input type="checkbox" checked={selectedChains.includes(chain)} onChange={() => toggleChain(chain)} className="w-4 h-4 rounded-none border-slate-300 text-red-600 focus:ring-red-600" />
                    <span className="text-sm font-semibold text-slate-700 group-hover/label:text-slate-900">{chain}</span>
                  </label>
                ))}
                {icaStores.length > 0 && icaStores.map(store => (
                  <label key={store.id} className="flex items-center gap-2 cursor-pointer group/label">
                    <input type="checkbox" checked={selectedIcaStores.includes(store.name)} onChange={() => toggleIcaStore(store.name)} className="w-4 h-4 rounded-none border-slate-300 text-red-600 focus:ring-red-600" />
                    <span className="text-sm font-semibold text-slate-700 group-hover/label:text-slate-900">{store.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group z-40">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors rounded-none">
              Kategorier
              {selectedCategories.length > 0 && <span className="bg-red-600 text-white text-[10px] w-4 h-4 rounded-none flex items-center justify-center">{selectedCategories.length}</span>}
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </button>
            <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[220px]">
              <div className="bg-white border border-slate-200 shadow-xl p-3 flex flex-col gap-2 rounded-none max-h-[60vh] overflow-y-auto">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group/label">
                    <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="w-4 h-4 rounded-none border-slate-300 text-red-600 focus:ring-red-600" />
                    <span className="text-sm font-semibold text-slate-700 group-hover/label:text-slate-900">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group z-30">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors rounded-none">
              Specialfilter
              {isMultiBuyOnly && <span className="bg-red-600 text-white text-[10px] w-4 h-4 rounded-none flex items-center justify-center">1</span>}
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </button>
            <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[220px]">
              <div className="bg-white border border-slate-200 shadow-xl p-3 flex flex-col gap-2 rounded-none">
                <label className="flex items-center gap-2 cursor-pointer group/label">
                  <input type="checkbox" checked={isMultiBuyOnly} onChange={() => setIsMultiBuyOnly((prev: boolean) => !prev)} className="w-4 h-4 rounded-none border-slate-300 text-red-600 focus:ring-red-600" />
                  <span className="text-sm font-semibold text-slate-700 group-hover/label:text-slate-900">Flerköpsrabatter</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-none px-2 shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="bg-transparent text-xs font-bold text-slate-700 py-1.5 focus:outline-none cursor-pointer">
            <option value="price-asc">Lägst pris</option>
            <option value="price-desc">Högst pris</option>
            <option value="discount-desc">Störst rabatt</option>
            <option value="name-asc">A-Ö</option>
          </select>
        </div>
      </div>
    </header>
  );
};
