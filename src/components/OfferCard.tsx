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

  // Helper to clean and format price unit
  const cleanPriceUnit = (unit: string) => {
    if (!unit) return '';
    let str = unit.toLowerCase();
    
    // Remove all exclamation marks (sometimes placed randomly like "!Välj & blanda" or "!24 för 99")
    str = str.replace(/!/g, '').trim();
    
    // Remove "välj & blanda" and variants
    str = str.replace(/välj\s*(&|och)?\s*blanda/gi, '').trim();
    str = str.replace(/välj bland flera( sorter)?/gi, '').trim();
    
    // Convert "4 för 10,00" -> "4 för 10"
    str = str.replace(/(\d+)\s*för\s*(\d+),00/gi, '$1 för $2');
    
    // Add "kr" if it's just "X för Y" or "X för Y,ZZ"
    if (/^\d+\s*för\s*\d+(,\d+)?$/.test(str)) {
      str += ' kr';
    }
    
    // If it's not a multibuy, strip the leading number (e.g. "25 kr/st" -> "kr/st") so we don't duplicate offer_price
    if (!str.includes('för')) {
      str = str.replace(/^[\d.,]+\s*/, '');
    }
    
    return str || 'kr/st';
  };

  const displayUnit = cleanPriceUnit(offer.price_unit);
  const isMultiBuy = displayUnit.includes('för');

  return (
    <div
      onClick={() => onSelectOffer(offer)}
      className="group relative bg-white overflow-hidden transform will-change-transform transition-all duration-300 flex flex-col justify-between cursor-pointer border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 hover:z-10"
    >
      <div className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full bg-[#F8F9FA] flex items-center justify-center p-8">
          <img
            src={offer.image_url}
            alt={offer.title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 && (
            <div className="absolute top-4 left-4 bg-[#E31837] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none shadow-sm">
              Spara {discountPercent}%
            </div>
          )}

          {/* Floating Add Button */}
          <button
            onClick={handleAddClick}
            className={`absolute bottom-4 right-4 w-11 h-11 rounded-none flex items-center justify-center transition-all duration-300 shadow-sm ${
              isInList
                ? 'bg-[#10B981] text-white scale-105'
                : 'bg-white text-slate-400 hover:bg-slate-900 hover:text-white border border-slate-100'
            }`}
            title={isInList ? 'Borttagen från inköpslista' : 'Spara i inköpslista'}
          >
            {isInList ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 bg-white">
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              <span className="truncate">{offer.store?.name || 'Uppsala'}</span>
            </div>

            <h3 className="text-base sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#E31837] transition-colors min-h-[3rem]">
              {offer.title}
            </h3>
          </div>

          {/* Typography-driven Price Lockup */}
          <div className="mt-auto flex flex-col items-start">
            <div className="flex items-baseline gap-1.5 text-[#E31837] flex-wrap">
              {isMultiBuy ? (
                <span className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">
                  {displayUnit}
                </span>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">
                    {offer.offer_price.toString().includes('.') ? offer.offer_price.toFixed(2).replace('.', ',') : offer.offer_price}
                  </span>
                  <span className="text-sm font-bold tracking-tight">{displayUnit}</span>
                </>
              )}
            </div>

            {/* Sub-pricing info */}
            <div className="flex flex-col gap-0.5 mt-2">
              {isMultiBuy && (
                <span className="text-[11px] font-bold text-[#E31837]/80">
                  {offer.offer_price.toFixed(2).replace('.', ',')} kr/st
                </span>
              )}
              {offer.compare_price && (
                <span className="text-[11px] font-semibold text-slate-400">
                  Jmf {offer.compare_price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
