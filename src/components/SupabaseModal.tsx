'use client';

import React, { useState } from 'react';
import { X, Database, Zap, RefreshCw, Info } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLive: boolean;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, isLive }) => {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerLiveSync = async () => {
    if (!window.confirm("Är du säker på att du vill hämta nya erbjudanden? Detta kan ta en liten stund.")) {
      return;
    }
    
    setIsSyncing(true);
    setSyncStatus('Hämtar färska erbjudanden från ICA, Willys & Hemköp API:er...');
    try {
      const res = await fetch('/api/sync-offers');
      const data = await res.json();
      if (data.message) {
        setSyncStatus(`✅ ${data.message}`);
      } else {
        setSyncStatus('✅ Synkronisering slutförd!');
      }
    } catch (err: any) {
      setSyncStatus(`❌ Fel vid synk: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isLive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                Supabase & Live API Integration
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold border uppercase tracking-wider ${
                    isLive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isLive ? '🟢 Ansluten' : '⚡ Demo (Mock Dataset)'}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-900 bg-slate-50">
          {/* Live Sync Trigger Button */}
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className={`w-8 h-8 ${isSyncing ? 'animate-spin' : ''}`} />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">
                Hämta veckans erbjudanden
              </h4>
              <p className="text-sm text-slate-500 font-medium max-w-sm mb-6">
                Skrapar live från alla konfigurerade butiker och uppdaterar databasen. Detta tar cirka 15–30 sekunder beroende på hur många butiker som hämtas.
              </p>

              <button
                onClick={triggerLiveSync}
                disabled={isSyncing}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer w-full sm:w-auto"
              >
                <Zap className="w-4 h-4" />
                {isSyncing ? 'Synkroniserar erbjudanden...' : 'Starta synkronisering'}
              </button>
            </div>

            {syncStatus && (
              <div className="mt-4 p-4 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 border border-slate-200 shadow-inner max-w-lg mx-auto text-center">
                {syncStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
