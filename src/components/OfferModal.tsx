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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image */}
        <div className="relative w-full h-64 bg-slate-50 shrink-0 flex items-center justify-center p-6">
          <img src={offer.image_url} alt={offer.title} className="w-full h-full object-contain mix-blend-multiply" />
          
          {/* Chain Badge */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-wider shadow-sm">
              {offer.store?.chain || 'Butik'}
            </span>
            {offer.is_membership && (
              <span className="bg-amber-100 text-amber-800 font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-amber-200">
                <Award className="w-3.5 h-3.5" /> Medlem
              </span>
            )}
          </div>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900">
          {/* Title & Category */}
          <div>
            <div className="text-[11px] text-slate-500 font-bold mb-1.5 uppercase tracking-widest bg-slate-100 inline-block px-2 py-0.5 rounded-md">
              {offer.category}
            </div>
            <h2 className="text-2xl font-black leading-tight text-slate-900">{offer.title}</h2>
          </div>

          {/* Price & Savings Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Erbjudandepris</div>
              <div className="flex items-baseline gap-1.5 mt-0.5 bg-red-600 text-white px-3 py-2 rounded-xl shadow-sm w-max">
                {offer.price_unit.toLowerCase().includes('för') ? (
                  <div className="flex flex-col items-start">
                    <span className="text-3xl font-black leading-none">
                      {offer.price_unit}
                    </span>
                    <span className="text-sm text-red-100 font-medium mt-1">
                      ({offer.offer_price.toFixed(2).replace('.', ',')} kr/st)
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl font-black">
                      {offer.offer_price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm text-red-100 font-bold">{offer.price_unit}</span>
                  </>
                )}
              </div>
              
              <div className="mt-3 space-y-1">
                {offer.original_price && (
                  <div className="text-xs text-slate-500 line-through font-medium">
                    Ordinarie pris: {offer.original_price.toFixed(2).replace('.', ',')} kr
                  </div>
                )}
                {offer.compare_price && (
                  <div className="text-xs text-slate-600 font-semibold">
                    Jmf: {offer.compare_price}
                  </div>
                )}
                {offer.reference_price && (
                  <div className="text-xs text-slate-500">
                    Lägsta 30 dgr: {offer.reference_price.toFixed(2).replace('.', ',')} kr
                  </div>
                )}
              </div>
            </div>

            {savingsAmount && (
              <div className="text-right bg-red-50 border border-red-100 p-3 rounded-xl shadow-sm">
                <div className="text-[10px] text-red-600 font-black uppercase tracking-wider">Du sparar</div>
                <div className="text-2xl font-black text-red-600 mt-0.5">{savingsAmount} kr</div>
                {discountPercent && (
                  <div className="text-xs text-white bg-red-600 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">-{discountPercent}%</div>
                )}
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  {offer.store?.name || 'Butik i Uppsala'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                  {offer.store?.address || 'Uppsala'}
                </p>
              </div>

              <a
                href={getGoogleMapsLink(offer.store?.address, offer.store?.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Navigation className="w-3.5 h-3.5" />
                Karta
              </a>
            </div>

            {offer.store?.opening_hours && (
              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Öppettider: {offer.store.opening_hours}
              </div>
            )}
          </div>

          {/* Validity Note */}
          <div className="text-xs text-slate-500 flex items-center justify-between px-1 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Gäller f.o.m. {offer.valid_from} t.o.m. {offer.valid_to}
            </span>
            <button
              onClick={handleShare}
              className="text-slate-600 font-bold flex items-center gap-1 hover:text-red-600 hover:underline bg-slate-100 px-2.5 py-1 rounded-md"
            >
              <Share2 className="w-3 h-3" /> Dela
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-white border-t border-slate-200 flex items-center gap-3">
          <button
            onClick={(e) => onToggleShoppingList(offer, e)}
            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              isInList
                ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                : 'bg-red-600 text-white hover:bg-red-700'
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
