'use client';

import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  selectedChain: string;
  selectedCategory: string;
  onResetFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  selectedChain,
  selectedCategory,
  onResetFilters,
}) => {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-sm">
        <SearchX className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-900">Inga erbjudanden hittades</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
          Vi kunde inte hitta några matchande erbjudanden i Uppsala just nu.
          {searchQuery && (
            <span>
              {' '}
              Sökning: &quot;<strong className="text-slate-700">{searchQuery}</strong>&quot;.
            </span>
          )}
          {selectedChain !== 'Alla' && (
            <span>
              {' '}
              Kedja: <strong className="text-slate-700">{selectedChain}</strong>.
            </span>
          )}
          {selectedCategory !== 'Alla' && (
            <span>
              {' '}
              Kategori: <strong className="text-slate-700">{selectedCategory}</strong>.
            </span>
          )}
        </p>
      </div>

      <button
        onClick={onResetFilters}
        className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl inline-flex items-center gap-2 transition-all shadow-sm mt-4"
      >
        <RotateCcw className="w-4 h-4" /> Rensa alla filter
      </button>
    </div>
  );
};
