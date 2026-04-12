export interface Product {
  id: string;
  name: string;
  sku: string;
  plu: string;
  color: string;
  facing: number;
  rh: number;
  image?: string;
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

export interface PlanogramState {
  products: Product[];
  shelves: Product[][];
  settings: GondolaSettings;
}

export const DEFAULT_PALETTE = [
  "#378ADD",
  "#D85A30",
  "#1D9E75",
  "#D4537E",
  "#639922",
  "#BA7517",
  "#534AB7",
  "#5F5E5A",
  "#E24B4A",
  "#0F6E56",
  "#3C3489",
  "#3B6D11",
];

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
