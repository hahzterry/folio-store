export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type Category = "shirts";

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[];
  /** price in cents */
  price: number;
  category: Category;
  collection: string;
  sizes: Size[];
  colors: ColorOption[];
  images: string[];
  tags: string[];
  inStock: boolean;
  featured?: boolean;
  newArrival?: boolean;
  /** Enriched fields sourced from the real product feed. */
  brand?: string | null;
  stock?: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: Size;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
  total: number;
  items: CartItem[];
  email: string;
}
