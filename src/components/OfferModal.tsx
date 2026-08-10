'use client';

import React from 'react';
import { X, MapPin, Clock, Award, Share2, Plus, Check, Navigation, ShoppingBag } from 'lucide-react';
import { Offer } from '@/lib/types';

interface OfferModalProps {
  offer: Offer | null;
  onClose: () => void;
  isInList: boolean;
  onToggleShoppingList: (offer: Offer, e: React.MouseEvent) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  offer,
  onClose,
  isInList,
  onToggleShoppingList,
}) => {
  if (!offer) return null;

  const discountPercent =
    offer.original_price && offer.original_price > offer.offer_price
      ? Math.round(((offer.original_price - offer.offer_price) / offer.original_price) * 100)
      : null;

  const savingsAmount =
    offer.original_price && offer.original_price > offer.offer_price
      ? (offer.original_price - offer.offer_price).toFixed(2).replace('.', ',')
      : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer.title,
          text: `Kolla in erbjduandet på ${offer.title} för ${offer.offer_price} kr hos ${offer.store?.name} i Uppsala!`,
          url: window.location.href,
        });
      } catch (err) {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(
        `Kolla in erbjduandet på ${offer.title} för ${offer.offer_price} kr hos ${offer.store?.name} i Uppsala!`
      );
      alert('Erbjudandelänk kopierad till urklipp!');
    }
  };

  const getGoogleMapsLink = (address?: string, storeName?: string) => {
    const q = encodeURIComponent(`${storeName || ''} ${address || ''} Uppsala`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-950 transition-colors border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image */}
        <div className="relative w-full h-56 bg-slate-950 shrink-0">
          <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

          {/* Chain Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg">
              {offer.store?.chain || 'Butik'}
            </span>
            {offer.is_membership && (
              <span className="bg-amber-500 text-amber-950 font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-lg">
                <Award className="w-3.5 h-3.5" /> Medlem
              </span>
            )}
          </div>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-100">
          {/* Title & Category */}
          <div>
            <div className="text-xs text-emerald-400 font-semibold mb-1 uppercase tracking-wider">
              {offer.category}
            </div>
            <h2 className="text-xl font-extrabold leading-snug">{offer.title}</h2>
          </div>

          {/* Price & Savings Box */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Erbjudandepris</div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                {offer.price_unit.toLowerCase().includes('för') ? (
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-emerald-400 leading-none">
                      {offer.price_unit}
                    </span>
                    <span className="text-sm text-emerald-300/80 font-medium mt-1">
                      ({offer.offer_price.toFixed(2).replace('.', ',')} kr/st)
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl font-black text-emerald-400">
                      {offer.offer_price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm text-emerald-300 font-semibold">{offer.price_unit}</span>
                  </>
                )}
              </div>
              {offer.original_price && (
                <div className="text-xs text-slate-500 line-through mt-0.5">
                  Ordinarie pris: {offer.original_price.toFixed(2).replace('.', ',')} kr
                </div>
              )}
              {offer.compare_price && (
                <div className="text-xs text-slate-400 mt-1">
                  Jämförpris: {offer.compare_price}
                </div>
              )}
              {offer.reference_price && (
                <div className="text-xs text-slate-400">
                  Lägsta pris 30 dgr: {offer.reference_price.toFixed(2).replace('.', ',')} kr
                </div>
              )}
            </div>

            {savingsAmount && (
              <div className="text-right bg-emerald-950/80 border border-emerald-800/80 p-2.5 rounded-xl">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">Du sparar</div>
                <div className="text-lg font-black text-emerald-300">{savingsAmount} kr</div>
                {discountPercent && (
                  <div className="text-[11px] text-emerald-400 font-extrabold">-{discountPercent}%</div>
                )}
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  {offer.store?.name || 'Butik i Uppsala'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  {offer.store?.address || 'Uppsala'}
                </p>
              </div>

              <a
                href={getGoogleMapsLink(offer.store?.address, offer.store?.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Karta
              </a>
            </div>

            {offer.store?.opening_hours && (
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-700/50 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Öppettider: {offer.store.opening_hours}
              </div>
            )}
          </div>

          {/* Validity Note */}
          <div className="text-xs text-slate-400 flex items-center justify-between px-1">
            <span>
              Gäller f.o.m. {offer.valid_from} t.o.m. {offer.valid_to}
            </span>
            <button
              onClick={handleShare}
              className="text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <Share2 className="w-3.5 h-3.5" /> Dela erbjduande
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={(e) => onToggleShoppingList(offer, e)}
            className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isInList
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 hover:bg-slate-700'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isInList ? (
              <>
                <Check className="w-5 h-5" /> Sparad i Inköpslista
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" /> Lägg till i Inköpslista
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
