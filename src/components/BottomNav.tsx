'use client';

import React from 'react';
import { Tag, ShoppingBag, Store as StoreIcon, Database } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'offers' | 'list' | 'stores' | 'sql';
  setActiveTab: (tab: 'offers' | 'list' | 'stores' | 'sql') => void;
  shoppingListCount: number;
  onOpenSupabaseModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  shoppingListCount,
  onOpenSupabaseModal,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] py-2 px-4">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Offers Tab */}
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 rounded-xl ${
            activeTab === 'offers' ? 'text-red-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-5 h-5" />
          <span className="text-[10px]">Erbjudanden</span>
          {activeTab === 'offers' && (
            <span className="absolute -bottom-1 w-8 h-1 rounded-full bg-red-600" />
          )}
        </button>

        {/* Shopping List Tab */}
        <button
          onClick={() => setActiveTab('list')}
          className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 rounded-xl ${
            activeTab === 'list' ? 'text-red-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {shoppingListCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {shoppingListCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Inköpslista</span>
          {activeTab === 'list' && <span className="absolute -bottom-1 w-8 h-1 rounded-full bg-red-600" />}
        </button>

        {/* Stores Tab */}
        <button
          onClick={() => setActiveTab('stores')}
          className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 rounded-xl ${
            activeTab === 'stores' ? 'text-red-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <StoreIcon className="w-5 h-5" />
          <span className="text-[10px]">Butiker</span>
          {activeTab === 'stores' && (
            <span className="absolute -bottom-1 w-8 h-1 rounded-full bg-red-600" />
          )}
        </button>

        {/* Supabase SQL Tab */}
        <button
          onClick={onOpenSupabaseModal}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-amber-600 transition-colors py-1 px-3"
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px]">SQL Schema</span>
        </button>
      </div>
    </nav>
  );
};
