'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Check, Clock, Tag, MapPin, Award } from 'lucide-react';
import { Offer } from '@/lib/types';
import confetti from 'canvas-confetti';

interface OfferCardProps {
  offer: Offer;
  onSelectOffer: (offer: Offer) => void;
  isInList: boolean;
  onToggleShoppingList: (offer: Offer, e: React.MouseEvent) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onSelectOffer,
  isInList,
  onToggleShoppingList,
}) => {
  // Calculate discount percentage if original price exists
  const discountPercent =
    offer.original_price && offer.original_price > offer.offer_price
      ? Math.round(((offer.original_price - offer.offer_price) / offer.original_price) * 100)
      : null;

  const getChainBadgeStyle = (chain?: string) => {
    switch (chain) {
      case 'Willys':
        return 'bg-red-600 text-white font-bold';
      case 'Hemköp':
        return 'bg-emerald-600 text-white font-bold';
      case 'ICA':
        return 'bg-rose-600 text-white font-bold';
      default:
        return 'bg-slate-100 text-slate-600 font-bold';
    }
  };

  // Helper to check if valid_to is within 48h
  const isEndingSoon = () => {
    const validToDate = new Date(offer.valid_to);
    const now = new Date();
    const diffHours = (validToDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48;
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInList) {
      // Trigger subtle particle burst
      try {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { x, y },
          colors: ['#10b981', '#34d399', '#f59e0b'],
          disableForReducedMotion: true,
        });
      } catch (err) {
        // ignore fallback
      }
    }
    onToggleShoppingList(offer, e);
  };

  return (
    <div
      onClick={() => onSelectOffer(offer)}
      className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Header & Image */}
        <div className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden flex items-center justify-center p-4">
          <img
            src={offer.image_url}
            alt={offer.title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Chain & Store Location Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider shadow-sm ${getChainBadgeStyle(
                offer.store?.chain
              )}`}
            >
              {offer.store?.chain || 'Butik'}
            </span>
          </div>

          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              -{discountPercent}%
            </div>
          )}

          {/* Add to Shopping List Floating Button */}
          <button
            onClick={handleAddClick}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
              isInList
                ? 'bg-emerald-500 text-white scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
            title={isInList ? 'Borttagen från inköpslista' : 'Spara i inköpslista'}
          >
            {isInList ? <Check className="w-5 h-5 stroke-[3]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col justify-between bg-white border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                {offer.category}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{offer.store?.name || 'Uppsala'}</span>
              </div>
            </div>

            <h3 className="text-[15px] font-bold text-slate-900 line-clamp-2 leading-snug mt-1 group-hover:text-red-600 transition-colors">
              {offer.title}
            </h3>
            
            {offer.is_membership && (
              <div className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                <Award className="w-3 h-3" />
                Medlemspris
              </div>
            )}
          </div>

          {/* Pricing Section (ICA style) */}
          <div className="mt-4 flex items-end justify-between">
            <div className="flex flex-col">
              {offer.original_price && offer.original_price > offer.offer_price && (
                <span className="text-[11px] text-slate-400 line-through font-medium mb-0.5">
                  Ord. {offer.original_price.toFixed(2).replace('.', ',')} kr
                </span>
              )}

              <div className="flex items-baseline gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm w-max">
                {offer.price_unit.toLowerCase().includes('för') ? (
                  <div className="flex flex-col items-start">
                    <span className="text-xl font-black tracking-tight leading-none">
                      {offer.price_unit}
                    </span>
                    <span className="text-[10px] text-red-100 font-medium mt-0.5">
                      ({offer.offer_price.toFixed(2).replace('.', ',')} kr/st)
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-xl font-black tracking-tight leading-none">
                      {offer.offer_price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-red-100 font-bold ml-0.5">{offer.price_unit}</span>
                  </>
                )}
              </div>

              <div className="flex flex-col mt-1.5 space-y-0.5">
                {offer.compare_price && (
                  <span className="text-[10px] font-medium text-slate-500">
                    Jmf: {offer.compare_price}
                  </span>
                )}
                {offer.reference_price && (
                  <span className="text-[10px] font-medium text-slate-400">
                    Lägsta 30d: {offer.reference_price.toFixed(2).replace('.', ',')} kr
                  </span>
                )}
              </div>
            </div>

            {/* Expiration Tag */}
            {isEndingSoon() && (
              <div className="text-[10px] font-bold text-red-600 flex items-center gap-1 self-end mb-1">
                <Clock className="w-3 h-3" />
                Slutar snart
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
