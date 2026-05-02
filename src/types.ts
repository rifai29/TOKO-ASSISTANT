export interface Product {
  id: string;
  name: string;
  sku: string;
  plu: string;
  facing: number;
  rh: number;
  image?: string;
  shelf?: number;
  slot?: number;
  gondolaId?: string; // Added to track which gondola it belongs to
  expiryDate?: string;
  lastChecked?: string;
  soChecked?: string;
  tidyChecked?: boolean;
  priceChecked?: boolean;
}

export interface GondolaSettings {
  name: string;
  store: string;
  date: string;
  category: string;
  notes: string;
  shelfCount: number;
  width: number;
  height: number;
  pogId: string;
  supplier: string;
}

export interface Gondola {
  id: string;
  settings: GondolaSettings;
  shelves: Product[][];
  lastUpdated?: string;
}

export interface PlanogramState {
  products: Product[];
  gondolas: Gondola[];
  activeGondolaId: string;
}

export const SHELF_LEVELS = [
  "Selving 1",
  "Selving 2",
  "Selving 3",
  "Selving 4",
  "Selving 5",
  "Selving 6",
  "Selving 7",
  "Selving 8",
];
