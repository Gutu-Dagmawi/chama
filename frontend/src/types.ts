export interface Category {
  id: number;
  name: string;
}

export interface Product {
  uuid: string;
  type: string;
  name: string;
  description: string;
  stock?: number;
  base_price: number;
  category_id?: number;
  category?: Category;
  variants: Variant[];
  brand?: string;
  gender?: 'male' | 'female';
}

export interface Variant {
  sku: string;
  color: string;
  size: number;
  images?: string[];
  product_id: string;
  product?: Product;
} 