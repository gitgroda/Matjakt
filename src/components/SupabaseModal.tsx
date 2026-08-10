'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Database, Terminal, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '@/lib/sqlScript';

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

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const triggerLiveSync = async () => {
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
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Stödda butiker: ICA Rosendal, ICA Maxi Gnista, ICA Maxi Stenhagen, Willys & Hemköp
              </p>
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" /> Live API Synkronisering
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Kör en direkt API-hämtning för ICA Rosendal, ICA Maxi Gnista, Stenhagen, Willys & Hemköp.
                </p>
              </div>

              <button
                onClick={triggerLiveSync}
                disabled={isSyncing}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm shrink-0 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synkar...' : 'Kör Live API Synk'}
              </button>
            </div>

            {syncStatus && (
              <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 border border-slate-200 shadow-inner">
                {syncStatus}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> 1. Konfigurera `.env.local`
            </h4>
            <div className="bg-slate-900 p-4 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto space-y-1.5 shadow-inner">
              <div>NEXT_PUBLIC_SUPABASE_URL=https://ditt-projekt-id.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key-här</div>
            </div>
          </div>

          {/* SQL Code Preview & Copy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> PostgreSQL SQL Schema med FTS
              </span>
              <button
                onClick={copySql}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-slate-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Kopierad!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Kopiera SQL-Kod
                  </>
                )}
              </button>
            </div>

            <div className="relative bg-slate-900 rounded-2xl p-4 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto leading-relaxed shadow-inner">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
