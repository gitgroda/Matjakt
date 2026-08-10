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
        return 'bg-slate-100 text-slate-600';
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
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-red-600" />
            Matbutiker i Uppsala
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Öppettider och adresser för matbutiker i Uppsala (ICA, Willys, Hemköp)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['Alla', 'ICA', 'Willys', 'Hemköp'].map((chain) => (
            <button
              key={chain}
              onClick={() => setFilterChain(chain)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                filterChain === chain
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {chain}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök butik eller område (t.ex. Luthagen, Gottsunda, Stenhagen)..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
        />
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((store) => (
          <div
            key={store.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-md transition-all shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider shadow-sm ${getChainBadge(
                    store.chain
                  )}`}
                >
                  {store.chain}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2 leading-snug">{store.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {store.address || 'Uppsala'}
                </p>
              </div>

              <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center p-1 shadow-sm">
                <img src={store.logo_url || ''} alt={store.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-600 flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{store.opening_hours || '08:00 - 22:00'}</span>
              </div>

              <button
                onClick={() => openGoogleMaps(store)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Navigation className="w-3.5 h-3.5 text-slate-500" />
                Vägbeskrivning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
