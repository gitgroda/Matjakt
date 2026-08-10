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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-lg">Inköpslista</h3>
              <p className="text-xs text-slate-400">{items.length} sparade erbjudanden</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearList}
                className="text-xs text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Rensa hela listan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Savings Header Banner */}
        {items.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-4 py-3 border-b border-emerald-900/40 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">
                Beräknat Totalpris
              </div>
              <div className="text-xl font-black text-white">{totalPrice.toFixed(2).replace('.', ',')} kr</div>
            </div>

            {totalSavings > 0 && (
              <div className="text-right bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <div className="text-[10px] text-emerald-300 font-bold uppercase flex items-center gap-1 justify-end">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Totalt sparar du
                </div>
                <div className="text-sm font-black text-emerald-400">
                  {totalSavings.toFixed(2).replace('.', ',')} kr
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-200">Din inköpslista är tom</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Klicka på plustecknet (+) på erbjudandekorten för att spara varor till din nästa handling i Uppsala!
              </p>
            </div>
          ) : (
            items.map(({ offer, quantity }) => {
              const isChecked = Boolean(checkedIds[offer.id]);
              return (
                <div
                  key={offer.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-slate-950/60 border-slate-800 opacity-60 line-through'
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <button
                    onClick={() => toggleCheck(offer.id)}
                    className="text-slate-400 hover:text-emerald-400 shrink-0"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-12 h-12 object-cover rounded-xl shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-emerald-400 font-semibold truncate">
                      {offer.store?.name || 'Uppsala'}
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 truncate">{offer.title}</h4>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">
                      {(offer.offer_price * quantity).toFixed(2).replace('.', ',')} kr
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        ({offer.offer_price.toFixed(2)} {offer.price_unit})
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(offer.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-extrabold text-white">{quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(offer.id, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => onRemoveItem(offer.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg shrink-0"
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
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
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
