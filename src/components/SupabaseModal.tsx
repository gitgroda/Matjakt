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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-100 text-lg flex items-center gap-2">
                Supabase & Live API Integration
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                    isLive
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {isLive ? '🟢 Supabase Ansluten' : '⚡ Demo (Mock Dataset)'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stödda butiker: ICA Rosendal, ICA Maxi Gnista, ICA Maxi Stenhagen, Willys & Hemköp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Live Sync Trigger Button */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 rounded-2xl border border-emerald-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Live API Synkronisering
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kör en direkt API-hämtning för ICA Rosendal, ICA Maxi Gnista, Stenhagen, Willys & Hemköp.
                </p>
              </div>

              <button
                onClick={triggerLiveSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shrink-0 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synkar...' : 'Kör Live API Synk'}
              </button>
            </div>

            {syncStatus && (
              <div className="p-2.5 bg-slate-950 rounded-xl text-xs font-mono text-emerald-300 border border-slate-800">
                {syncStatus}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> 1. Konfigurera `.env.local`
            </h4>
            <div className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-800 overflow-x-auto space-y-1">
              <div>NEXT_PUBLIC_SUPABASE_URL=https://ditt-projekt-id.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key-här</div>
            </div>
          </div>

          {/* SQL Code Preview & Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> PostgreSQL SQL Schema med FTS för Uppsala
              </span>
              <button
                onClick={copySql}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Kopierad!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Kopiera SQL-Kod
                  </>
                )}
              </button>
            </div>

            <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto leading-relaxed">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
