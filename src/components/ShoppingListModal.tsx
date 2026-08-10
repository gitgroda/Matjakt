'use client';

import React, { useState } from 'react';
import { X, Trash2, Copy, CheckSquare, Square, Sparkles, ShoppingBag, Plus, Minus } from 'lucide-react';
import { ShoppingListItem } from '@/lib/types';
import confetti from 'canvas-confetti';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  onUpdateQuantity: (offerId: string, delta: number) => void;
  onRemoveItem: (offerId: string) => void;
  onClearList: () => void;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearList,
}) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    const next = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(next);

    // If all items checked, throw celebratory confetti!
    const allChecked = items.length > 0 && items.every((it) => next[it.offer.id]);
    if (allChecked) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  // Calculations
  const totalPrice = items.reduce((acc, curr) => acc + curr.offer.offer_price * curr.quantity, 0);

  const totalOriginal = items.reduce((acc, curr) => {
    const orig = curr.offer.original_price || curr.offer.offer_price;
    return acc + orig * curr.quantity;
  }, 0);

  const totalSavings = Math.max(0, totalOriginal - totalPrice);

  const copyToClipboard = () => {
    if (items.length === 0) return;

    const listText = items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.offer.title} (${it.offer.offer_price.toFixed(2)} kr) - ${
            it.offer.store?.name || 'Butik'
          }`
      )
      .join('\n');

    const summaryText = `🛒 MATJAKT UPPSALA INKÖPSLISTA\n\n${listText}\n\nTotalt uppskattat pris: ${totalPrice.toFixed(
      2
    )} kr\nTotalt sparar du: ${totalSavings.toFixed(2)} kr! 🎉`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl">Inköpslista</h3>
              <p className="text-sm text-slate-500 font-medium">{items.length} varor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearList}
                className="text-xs text-slate-500 hover:text-red-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                title="Rensa hela listan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Savings Header Banner */}
        {items.length > 0 && (
          <div className="bg-red-600 px-5 py-4 border-b border-red-700 flex items-center justify-between">
            <div>
              <div className="text-xs text-red-100 uppercase font-bold tracking-wider">
                Beräknat Totalpris
              </div>
              <div className="text-3xl font-black text-white">{totalPrice.toFixed(2).replace('.', ',')} kr</div>
            </div>

            {totalSavings > 0 && (
              <div className="text-right bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-xl">
                <div className="text-[10px] text-red-100 font-bold uppercase flex items-center gap-1 justify-end">
                  <Sparkles className="w-3 h-3 text-white" /> Totalt sparar du
                </div>
                <div className="text-base font-black text-white mt-0.5">
                  {totalSavings.toFixed(2).replace('.', ',')} kr
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50">
          {items.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Din inköpslista är tom</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">
                Klicka på plustecknet (+) på erbjudandekorten för att spara varor till din nästa handling!
              </p>
            </div>
          ) : (
            items.map(({ offer, quantity }) => {
              const isChecked = Boolean(checkedIds[offer.id]);
              return (
                <div
                  key={offer.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm ${
                    isChecked
                      ? 'bg-slate-100 border-slate-200 opacity-60 line-through'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => toggleCheck(offer.id)}
                    className="text-slate-400 hover:text-red-600 shrink-0"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-6 h-6 text-red-600" />
                    ) : (
                      <Square className="w-6 h-6" />
                    )}
                  </button>

                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-14 h-14 object-contain rounded-xl shrink-0 mix-blend-multiply bg-slate-50 p-1 border border-slate-100"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate mb-0.5">
                      {offer.store?.name || 'Uppsala'}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{offer.title}</h4>
                    <div className="text-xs font-black text-slate-900 mt-1">
                      {(offer.offer_price * quantity).toFixed(2).replace('.', ',')} kr
                      <span className="text-[10px] text-slate-500 font-semibold ml-1">
                        ({offer.offer_price.toFixed(2).replace('.', ',')} {offer.price_unit})
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(offer.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center text-xs shadow-sm border border-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-black text-slate-900">{quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(offer.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center text-xs shadow-sm border border-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => onRemoveItem(offer.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-slate-200 flex items-center gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Kopierad till Urklipp! 👍' : 'Kopiera Inköpslista'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
