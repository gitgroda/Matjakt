import React from 'react';
import { SearchX, ShoppingCart } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  selectedChains: string[];
  selectedCategories: string[];
  selectedIcaStores: string[];
  isMultiBuyOnly: boolean;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  selectedChains,
  selectedCategories,
  selectedIcaStores,
  isMultiBuyOnly,
  onClearFilters,
}) => {
  const hasFilters = searchQuery || selectedChains.length > 0 || selectedCategories.length > 0 || selectedIcaStores.length > 0 || isMultiBuyOnly;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        {searchQuery ? (
          <SearchX className="w-10 h-10 text-slate-400" />
        ) : (
          <ShoppingCart className="w-10 h-10 text-slate-400" />
        )}
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {searchQuery ? 'Inga träffar' : 'Inga erbjudanden'}
      </h3>
      
      <p className="text-slate-500 max-w-sm mb-8">
        {hasFilters
          ? 'Vi hittade tyvärr inga erbjudanden som matchar dina nuvarande filter och sökord. Prova att ändra eller rensa dem.'
          : 'Det finns inga erbjudanden i databasen just nu. Klicka på databasikonen uppe i hörnet för att synkronisera data.'}
      </p>

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="bg-slate-900 text-white font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-colors shadow-sm"
        >
          Rensa alla filter
        </button>
      )}
    </div>
  );
};
