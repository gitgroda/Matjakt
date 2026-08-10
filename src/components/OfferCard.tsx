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
        <div className="relative aspect-[4/3] w-full bg-white overflow-hidden flex items-center justify-center p-6">
          <img
            src={offer.image_url}
            alt={offer.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 && (
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              -{discountPercent}%
            </div>
          )}

          {/* Add to Shopping List Floating Button */}
          <button
            onClick={handleAddClick}
            className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
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
        <div className="p-5 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{offer.store?.name || 'Uppsala'}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug mt-1 group-hover:text-red-600 transition-colors">
              {offer.title}
            </h3>
          </div>

          {/* Pricing Section */}
          <div className="mt-5 flex items-baseline gap-1.5 text-red-600">
            {offer.price_unit.toLowerCase().includes('för') ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight leading-none">
                  {offer.price_unit}
                </span>
              </div>
            ) : (
              <>
                <span className="text-2xl font-black tracking-tight leading-none">
                  {offer.offer_price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm font-bold">{offer.price_unit}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
