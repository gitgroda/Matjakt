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

  // Chain Badge Colors
  const getChainBadgeStyle = (chain?: string) => {
    switch (chain) {
      case 'Willys':
        return 'bg-red-600 text-white font-bold border-red-500';
      case 'Hemköp':
        return 'bg-emerald-600 text-white font-bold border-emerald-500';
      case 'ICA':
        return 'bg-rose-600 text-white font-bold border-rose-500';
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600';
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
      className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Header & Image */}
        <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
          <img
            src={offer.image_url}
            alt={offer.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

          {/* Chain & Store Location Badge */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 items-center">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider border shadow-md ${getChainBadgeStyle(
                offer.store?.chain
              )}`}
            >
              {offer.store?.chain || 'Butik'}
            </span>

            {offer.is_membership && (
              <span className="bg-amber-500/90 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md border border-amber-300">
                <Award className="w-3 h-3" />
                Medlem
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 && (
            <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-lg shadow-lg">
              -{discountPercent}%
            </div>
          )}

          {/* Add to Shopping List Floating Button */}
          <button
            onClick={handleAddClick}
            className={`absolute bottom-2.5 right-2.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xl ${
              isInList
                ? 'bg-emerald-500 text-slate-950 scale-105'
                : 'bg-slate-900/90 text-white hover:bg-emerald-500 hover:text-slate-950 hover:scale-110 border border-slate-700/80'
            }`}
            title={isInList ? 'Borttagen från inköpslista' : 'Spara i inköpslista'}
          >
            {isInList ? <Check className="w-5 h-5 stroke-[3]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
          </button>

          {/* Category Tag */}
          <div className="absolute bottom-2.5 left-2.5 text-[10px] text-slate-300 font-medium px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-xs border border-slate-700/50">
            {offer.category}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-1 truncate">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{offer.store?.name || 'Uppsala'}</span>
            </div>

            <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
              {offer.title}
            </h3>
          </div>

          {/* Pricing Section */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-baseline justify-between">
            <div className="flex flex-col">
              {offer.original_price && offer.original_price > offer.offer_price && (
                <span className="text-xs text-slate-500 line-through font-medium">
                  Ord. {offer.original_price.toFixed(2).replace('.', ',')} kr
                </span>
              )}

              <div className="flex items-baseline gap-1">
                {offer.price_unit.toLowerCase().includes('för') ? (
                  <div className="flex flex-col">
                    <span className="text-xl font-extrabold text-emerald-400 tracking-tight leading-none mt-1">
                      {offer.price_unit}
                    </span>
                    <span className="text-[11px] text-emerald-300/80 font-medium mt-0.5">
                      ({offer.offer_price.toFixed(2).replace('.', ',')} kr/st)
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-xl font-extrabold text-emerald-400 tracking-tight">
                      {offer.offer_price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-emerald-300/90 font-semibold">{offer.price_unit}</span>
                  </>
                )}
              </div>

              {offer.compare_price && (
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Jämförpris: {offer.compare_price}
                </span>
              )}
              {offer.reference_price && (
                <span className="text-[10px] text-slate-400">
                  Lägsta pris 30 dgr: {offer.reference_price.toFixed(2).replace('.', ',')} kr
                </span>
              )}
            </div>

            {/* Expiration Tag */}
            <div
              className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium ${
                isEndingSoon()
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60 animate-pulse'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{offer.valid_to ? `t.o.m. ${offer.valid_to.substring(5)}` : 'Veckan ut'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
