export type ChainType = 'Alla' | 'ICA' | 'Willys' | 'Hemköp';

export interface Store {
  id: string;
  name: string;
  chain: 'ICA' | 'Willys' | 'Hemköp';
  location: string;
  logo_url: string | null;
  address?: string;
  opening_hours?: string;
  allStoreNames?: string[];
}

export interface Offer {
  id: string;
  store_id: string;
  title: string;
  original_price: number | null;
  offer_price: number;
  price_unit: string;
  compare_price?: string;
  weight?: string;
  reference_price?: number;
  image_url: string;
  category: string;
  valid_from: string;
  valid_to: string;
  is_membership?: boolean;
  created_at?: string;
  store?: Store;
  allFlavors?: string[];
}

export type SortOption = 'best-price' | 'alphabetical' | 'ending-soon' | 'discount';

export interface ShoppingListItem {
  offer: Offer;
  quantity: number;
  addedAt: string;
}
