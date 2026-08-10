import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';
import { ChainType, Offer, SortOption, Store } from './types';

export function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes('YOUR_SUPABASE') &&
    !url.includes('placeholder') &&
    url.startsWith('http')
  );
  return { url, key, isConfigured };
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;
  if (!cachedClient) {
    const isServer = typeof window === 'undefined';
    cachedClient = createClient(url, key, {
      realtime: isServer ? { transport: ws as any } : undefined
    });
  }
  return cachedClient;
}

export const isSupabaseConfigured = getSupabaseCredentials().isConfigured;

interface QueryParams {
  searchQuery?: string;
  chain?: ChainType;
  category?: string;
  sortBy?: SortOption;
}

export async function getOffers(params: QueryParams): Promise<{ data: Offer[]; isLive: boolean; error?: string }> {
  const { searchQuery = '', chain = 'Alla', category = 'Alla', sortBy = 'best-price' } = params;
  const client = getSupabaseClient();

  if (client) {
    try {
      const fetchPage = async (pageIndex: number) => {
        let query = client.from('offers').select(`
          *,
          store:stores(*)
        `);

        const from = pageIndex * 1000;
        const to = from + 999;
        return await query.range(from, to);
      };

      let allData: any[] = [];
      let currentError = null;

      // Fetch up to 4 pages (4000 items) to ensure we get everything
      for (let i = 0; i < 4; i++) {
        const { data, error } = await fetchPage(i);
        if (error) {
          currentError = error;
          break;
        }
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < 1000) break; // Reached the end
        } else {
          break;
        }
      }

      if (currentError && allData.length === 0) {
        console.warn('Supabase query-fel:', currentError.message);
        return { data: [], isLive: false, error: currentError.message };
      }

      if (!allData || allData.length === 0) {
        return { data: [], isLive: true };
      }

      const formattedData: Offer[] = allData.map((item: any) => ({
        id: item.id,
        store_id: item.store_id,
        title: item.title,
        original_price: item.original_price ? Number(item.original_price) : null,
        offer_price: Number(item.offer_price),
        price_unit: item.price_unit,
        compare_price: item.compare_price || undefined,
        reference_price: item.reference_price ? Number(item.reference_price) : undefined,
        image_url: item.image_url,
        category: item.category,
        valid_from: item.valid_from,
        valid_to: item.valid_to,
        is_membership: Boolean(item.is_membership),
        created_at: item.created_at,
        store: item.store ? {
          id: item.store.id,
          name: item.store.name,
          chain: item.store.chain,
          location: item.store.location,
          logo_url: item.store.logo_url,
          address: item.store.address,
          opening_hours: item.store.opening_hours
        } : undefined
      }));

      if (sortBy === 'discount') {
        formattedData.sort((a, b) => {
          const discountA = a.original_price ? (a.original_price - a.offer_price) / a.original_price : 0;
          const discountB = b.original_price ? (b.original_price - b.offer_price) / b.original_price : 0;
          return discountB - discountA;
        });
      }

      return { data: formattedData, isLive: true };
    } catch (err: any) {
      console.warn('Undantag vid Supabase-anrop:', err);
      return { data: [], isLive: false, error: err?.message };
    }
  }

  return { data: [], isLive: false };
}

export async function getStores(): Promise<{ data: Store[]; isLive: boolean }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('stores').select('*').order('name');
      if (!error && data && data.length > 0) {
        return { data: data as Store[], isLive: true };
      }
    } catch (err) {
      console.warn('Error fetching stores from Supabase:', err);
    }
  }
  return { data: [], isLive: false };
}
