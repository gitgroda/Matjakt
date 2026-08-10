'use client';

import React, { useState } from 'react';
import { Store } from '@/lib/types';
import { MapPin, Clock, Navigation, Search, Store as StoreIcon } from 'lucide-react';

interface StoresViewProps {
  stores: Store[];
  onSelectChain: (chain: any) => void;
}

export const StoresView: React.FC<StoresViewProps> = ({ stores, onSelectChain }) => {
  const [filterChain, setFilterChain] = useState<string>('Alla');
  const [query, setQuery] = useState<string>('');

  const filtered = stores.filter((st) => {
    const matchChain = filterChain === 'Alla' || st.chain === filterChain;
    const matchQuery =
      st.name.toLowerCase().includes(query.toLowerCase()) ||
      (st.address && st.address.toLowerCase().includes(query.toLowerCase()));
    return matchChain && matchQuery;
  });

  const getChainBadge = (chain: string) => {
    switch (chain) {
      case 'Willys':
        return 'bg-red-600 text-white';
      case 'Hemköp':
        return 'bg-emerald-600 text-white';
      case 'ICA':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  const openGoogleMaps = (store: Store) => {
    const q = encodeURIComponent(`${store.name} ${store.address || ''} Uppsala`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-emerald-400" />
            Matbutiker i Uppsala
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Öppettider och adresser för matbutiker i Uppsala (ICA, Willys, Hemköp)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['Alla', 'ICA', 'Willys', 'Hemköp'].map((chain) => (
            <button
              key={chain}
              onClick={() => setFilterChain(chain)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterChain === chain
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {chain}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök butik eller område (t.ex. Luthagen, Gottsunda, Stenhagen)..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((store) => (
          <div
            key={store.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider ${getChainBadge(
                    store.chain
                  )}`}
                >
                  {store.chain}
                </span>
                <h3 className="text-base font-extrabold text-slate-100 mt-2">{store.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {store.address || 'Uppsala'}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                <img src={store.logo_url || ''} alt={store.name} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{store.opening_hours || '08:00 - 22:00'}</span>
              </div>

              <button
                onClick={() => openGoogleMaps(store)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Navigation className="w-3 h-3 text-emerald-400" />
                Vägbeskrivning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
