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
      let query = client.from('offers').select(`
        *,
        store:stores(*)
      `);

      // Chain filter
      if (chain !== 'Alla') {
        const { data: chainStores, error: storeErr } = await client
          .from('stores')
          .select('id')
          .eq('chain', chain);

        if (storeErr) {
          console.warn('Fel vid hämtning av butiker från Supabase:', storeErr.message);
        }

        if (chainStores && chainStores.length > 0) {
          const storeIds = chainStores.map((s) => s.id);
          query = query.in('store_id', storeIds);
        } else {
          return { data: [], isLive: true };
        }
      }

      // Category filter
      if (category !== 'Alla') {
        query = query.eq('category', category);
      }

      // Full Text Search or ILIKE on Title & Category
      const cleanSearch = searchQuery.trim();
      if (cleanSearch) {
        query = query.or(`title.ilike.%${cleanSearch}%,category.ilike.%${cleanSearch}%`);
      }

      // Sorting
      if (sortBy === 'best-price') {
        query = query.order('offer_price', { ascending: true });
      } else if (sortBy === 'alphabetical') {
        query = query.order('title', { ascending: true });
      } else if (sortBy === 'ending-soon') {
        query = query.order('valid_to', { ascending: true });
      } else if (sortBy === 'discount') {
        query = query.order('offer_price', { ascending: true });
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.warn('Supabase query-fel:', error.message);
        return { data: [], isLive: false, error: error.message };
      }

      if (!data) {
        return { data: [], isLive: true };
      }

      const formattedData: Offer[] = data.map((item: any) => ({
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
