'use client';

import React from 'react';
import { SupabaseModal } from '@/components/SupabaseModal';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SyncOffersPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-12">
      <SupabaseModal
        isOpen={true}
        onClose={() => router.push('/')}
        isLive={isSupabaseConfigured}
      />
    </div>
  );
}
